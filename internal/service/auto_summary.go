package service

import (
	"context"
	"scriberr/internal/llm"
	"scriberr/internal/models"
	"scriberr/internal/repository"
	"scriberr/pkg/logger"
	"strings"
)

// AutoSummaryService handles automatic summary generation after transcription
type AutoSummaryService struct {
	jobRepo         repository.JobRepository
	summaryRepo     repository.SummaryRepository
	llmConfigRepo   repository.LLMConfigRepository
	summaryTplRepo  repository.SummaryRepository // reusing for template methods
}

// NewAutoSummaryService creates a new auto summary service
func NewAutoSummaryService(
	jobRepo repository.JobRepository,
	summaryRepo repository.SummaryRepository,
	llmConfigRepo repository.LLMConfigRepository,
) *AutoSummaryService {
	return &AutoSummaryService{
		jobRepo:        jobRepo,
		summaryRepo:    summaryRepo,
		llmConfigRepo:  llmConfigRepo,
		summaryTplRepo: summaryRepo,
	}
}

// GenerateSummaryForJob generates a summary for a completed transcription job
func (s *AutoSummaryService) GenerateSummaryForJob(ctx context.Context, jobID string) error {
	logger.Info("Starting auto-summary generation", "job_id", jobID)

	// Get the job with transcript
	job, err := s.jobRepo.FindByID(ctx, jobID)
	if err != nil {
		logger.Error("Failed to find job for auto-summary", "job_id", jobID, "error", err)
		return err
	}

	// Check if job has transcript
	if job.Transcript == nil || *job.Transcript == "" {
		logger.Debug("Job has no transcript, skipping auto-summary", "job_id", jobID)
		return nil
	}

	// Get LLM config
	llmConfig, err := s.llmConfigRepo.GetActive(ctx)
	if err != nil || llmConfig == nil || !llmConfig.IsActive {
		logger.Debug("No active LLM config, skipping auto-summary", "job_id", jobID)
		return nil
	}

	// Get default summary template
	templates, _, err := s.summaryTplRepo.List(ctx, 0, 1)
	if err != nil || len(templates) == 0 {
		logger.Debug("No summary templates found, skipping auto-summary", "job_id", jobID)
		return nil
	}
	template := templates[0]

	// Create LLM service
	var svc llm.Service
	if llmConfig.Provider == "ollama" {
		baseURL := "http://localhost:11434"
		if llmConfig.BaseURL != nil && *llmConfig.BaseURL != "" {
			baseURL = *llmConfig.BaseURL
		}
		svc = llm.NewOllamaService(baseURL)
	} else {
		apiKey := ""
		if llmConfig.APIKey != nil {
			apiKey = *llmConfig.APIKey
		}
		baseURL := llmConfig.OpenAIBaseURL
		svc = llm.NewOpenAIService(apiKey, baseURL)
	}

	// Prepare the prompt - replace {{transcript}} with actual content
	// Truncate transcript if too long (limit to ~25k tokens ≈ 100k chars to stay under rate limits)
	transcript := *job.Transcript
	const maxTranscriptChars = 100000
	if len(transcript) > maxTranscriptChars {
		transcript = transcript[:maxTranscriptChars] + "\n\n[... transcript truncated due to length ...]"
		logger.Info("Truncated long transcript for auto-summary", "job_id", jobID, "original_len", len(*job.Transcript), "truncated_len", len(transcript))
	}
	prompt := strings.Replace(template.Prompt, "{{transcript}}", transcript, 1)

	// Generate summary (non-streaming for background task)
	messages := []llm.ChatMessage{{Role: "user", Content: prompt}}
	resp, err := svc.ChatCompletion(ctx, template.Model, messages, 0.0)
	if err != nil {
		logger.Error("Failed to generate auto-summary", "job_id", jobID, "error", err)
		return err
	}

	if resp == nil || len(resp.Choices) == 0 {
		logger.Error("Empty response from LLM for auto-summary", "job_id", jobID)
		return nil
	}

	summaryContent := resp.Choices[0].Message.Content

	// Save the summary
	templateID := template.ID
	summary := &models.Summary{
		TranscriptionID: jobID,
		TemplateID:      &templateID,
		Model:           template.Model,
		Content:         summaryContent,
	}

	if err := s.summaryRepo.SaveSummary(ctx, summary); err != nil {
		logger.Error("Failed to save auto-summary", "job_id", jobID, "error", err)
		// Fallback: store on job record
		_ = s.jobRepo.UpdateSummary(ctx, jobID, summaryContent)
	} else {
		// Also cache on job for quick access
		_ = s.jobRepo.UpdateSummary(ctx, jobID, summaryContent)
	}

	logger.Info("Auto-summary generated successfully", "job_id", jobID, "length", len(summaryContent))
	return nil
}
