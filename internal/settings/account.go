package settings

// AccountDefaults contains default account/user settings.
// Modify these values to change the default behavior for new users.
var AccountDefaults = struct {
	// ═══════════════════════════════════════════════════════════════
	// AUTO-TRANSCRIPTION SETTINGS
	// ═══════════════════════════════════════════════════════════════

	// AutoTranscriptionEnabled: Automatically start transcription when files are uploaded
	AutoTranscriptionEnabled bool

	// DefaultProfileID: ID of the default profile to use for auto-transcription
	// Leave empty to use the first available profile marked as default
	DefaultProfileID string
}{
	AutoTranscriptionEnabled: false,
	DefaultProfileID:         "", // Will use default profile from TranscriptionProfile
}
