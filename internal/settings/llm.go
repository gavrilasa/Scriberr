package settings

import (
	"os"
	"scriberr/internal/models"
)

// DefaultLLMConfig returns the default LLM provider configuration.
// Modify these values to change the default LLM settings.
func DefaultLLMConfig() *models.LLMConfig {
	return &models.LLMConfig{
		// ═══════════════════════════════════════════════════════════════
		// LLM PROVIDER SETTINGS
		// ═══════════════════════════════════════════════════════════════

		// Provider: LLM provider type
		// Options: "ollama", "openai"
		Provider: "openai",

		// BaseURL: Ollama server URL (only used when Provider = "ollama")
		BaseURL: ptrString("http://localhost:11434"),

		// OpenAIBaseURL: Custom OpenAI-compatible endpoint (optional)
		// Use for providers like Azure OpenAI, LocalAI, etc.
		OpenAIBaseURL: nil,

		// APIKey: OpenAI API key (only used when Provider = "openai")
		// Recommended: Set via OPENAI_API_KEY environment variable instead
		APIKey: getEnvPtr("OPENAI_API_KEY"),

		// IsActive: Whether this LLM config is active
		// Set to true to enable chat and summary features
		IsActive: true,
	}
}

// ptrString is a helper to create pointer to string
func ptrString(s string) *string { return &s }

// getEnvPtr gets environment variable as pointer, nil if empty
func getEnvPtr(key string) *string {
	if val := os.Getenv(key); val != "" {
		return &val
	}
	return nil
}
