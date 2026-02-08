package settings

import "scriberr/internal/models"

// DefaultTranscriptionProfile returns the default transcription profile configuration.
// Modify these values to change the default transcription settings.
func DefaultTranscriptionProfile() *models.TranscriptionProfile {
	return &models.TranscriptionProfile{
		Name:        "Default Profile",
		Description: ptr("Default transcription profile - configured in code"),
		IsDefault:   true,
		Parameters: models.WhisperXParams{
			// ═══════════════════════════════════════════════════════════════
			// MODEL CONFIGURATION
			// ═══════════════════════════════════════════════════════════════
			
			// ModelFamily: Choose transcription engine
			// Options: "whisper" (WhisperX), "nvidia" (Parakeet/Canary)
			ModelFamily: "whisper",

			// Model: Whisper model size
			// Options: "tiny", "base", "small", "medium", "large", "large-v2", "large-v3"
			// Larger = more accurate but slower
			Model: "small",

			// ═══════════════════════════════════════════════════════════════
			// DEVICE & PERFORMANCE
			// ═══════════════════════════════════════════════════════════════

			// Device: Processing device
			// Options: "cpu", "cuda" (NVIDIA GPU)
			Device: "cpu",

			// DeviceIndex: GPU index if using CUDA (0 = first GPU)
			DeviceIndex: 0,

			// BatchSize: Number of audio segments to process at once
			// Higher = faster but uses more memory
			BatchSize: 8,

			// ComputeType: Precision for computation
			// Options: "float32", "float16", "int8"
			// Lower precision = faster but slightly less accurate
			ComputeType: "float32",

			// Threads: CPU threads to use (0 = auto)
			Threads: 0,

			// ═══════════════════════════════════════════════════════════════
			// SPEAKER DETECTION (DIARIZATION)
			// ═══════════════════════════════════════════════════════════════

			// Diarize: Enable speaker detection
			// Requires HF_TOKEN environment variable with HuggingFace token
			Diarize: false,

			// DiarizeModel: Model for speaker detection
			// Options: "pyannote", "sortformer" (NVIDIA)
			DiarizeModel: "pyannote",

			// MinSpeakers / MaxSpeakers: Hint for number of speakers (nil = auto-detect)
			MinSpeakers: nil,
			MaxSpeakers: nil,

			// ═══════════════════════════════════════════════════════════════
			// ═══════════════════════════════════════════════════════════════
			// ALIGNMENT SETTINGS
			// ═══════════════════════════════════════════════════════════════

			// AlignModel: Custom alignment model (e.g. for Indonesian)
			// Required for languages like 'id' that don't have built-in WhisperX alignment
			AlignModel: ptrString("indonesian-nlp/wav2vec2-large-xlsr-indonesian"),

			OutputFormat:       "all",
			Verbose:            true,
			SegmentResolution:  "sentence",
			HighlightWords:     false,
			PrintProgress:      false,
		},
	}
}

// ptr is a helper to create pointer to string
func ptr(s string) *string { return &s }
