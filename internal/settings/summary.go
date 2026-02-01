package settings

import "scriberr/internal/models"

// DefaultSummaryTemplates returns the default summary templates.
// Add or modify templates here to provide preset summarization prompts.
func DefaultSummaryTemplates() []*models.SummaryTemplate {
	return []*models.SummaryTemplate{
		// ═══════════════════════════════════════════════════════════════
		// PSYCHOLOGY SOAP NOTE TEMPLATE
		// ═══════════════════════════════════════════════════════════════
		{
			Name:        "Psychology SOAP Note",
			Description: ptrString("Generate a structured SOAP note from a psychology consultation transcript"),
			Model:       "gpt-4o-mini",
			Prompt: `You are a clinical documentation assistant for psychology consultations. Analyze the following transcript and generate a structured SOAP note following medical documentation standards.

## SOAP FORMAT

### S - Subjective
Document the patient's self-reported information:
- Chief complaint and presenting concerns
- History of present illness (HPI)
- Patient's description of symptoms, feelings, and experiences
- Relevant psychosocial history mentioned
- Patient's goals for therapy

### O - Objective
Document observable and measurable findings:
- Mental status examination observations (appearance, behavior, affect, mood, speech, thought process)
- Behavioral observations during session
- Clinician's objective observations
- Any assessment scores or test results mentioned

### A - Assessment
Provide clinical interpretation:
- Clinical impressions and diagnostic considerations
- Progress toward treatment goals
- Risk assessment (suicidal/homicidal ideation, self-harm)
- Functional impairment level
- Therapeutic alliance assessment

### P - Plan
Document the treatment plan:
- Interventions used in this session
- Homework or tasks assigned
- Modifications to treatment plan
- Referrals or consultations needed
- Next appointment and session goals
- Safety planning if applicable

---

**Important Guidelines:**
- Use professional clinical language
- Be concise but thorough
- Maintain patient confidentiality standards
- Note any safety concerns prominently
- Include direct quotes when clinically relevant (marked with quotation marks)

TRANSCRIPT:
{{transcript}}`,
		},
	}
}


