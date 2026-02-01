package settings

import (
	"scriberr/internal/models"
	"scriberr/pkg/logger"

	"gorm.io/gorm"
)

// SeedDefaults seeds the database with default configuration.
// This should be called after database initialization in main.go.
// It only creates defaults if they don't already exist.
func SeedDefaults(db *gorm.DB) error {
	logger.Info("Checking and seeding default configuration...")

	if err := seedTranscriptionProfile(db); err != nil {
		return err
	}

	if err := seedLLMConfig(db); err != nil {
		return err
	}

	if err := seedSummaryTemplates(db); err != nil {
		return err
	}

	logger.Info("Default configuration seeding complete")
	return nil
}

// seedTranscriptionProfile creates the default transcription profile if none exists
func seedTranscriptionProfile(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.TranscriptionProfile{}).Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		profile := DefaultTranscriptionProfile()
		if err := db.Create(profile).Error; err != nil {
			logger.Error("Failed to seed default transcription profile", "error", err)
			return err
		}
		logger.Info("Created default transcription profile", "name", profile.Name)
	} else {
		logger.Debug("Transcription profiles already exist, skipping seed")
	}

	return nil
}

// seedLLMConfig creates the default LLM config if none exists
func seedLLMConfig(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.LLMConfig{}).Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		config := DefaultLLMConfig()
		if err := db.Create(config).Error; err != nil {
			logger.Error("Failed to seed default LLM config", "error", err)
			return err
		}
		logger.Info("Created default LLM config", "provider", config.Provider)
	} else {
		logger.Debug("LLM config already exists, skipping seed")
	}

	return nil
}

// seedSummaryTemplates creates default summary templates if none exist
func seedSummaryTemplates(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.SummaryTemplate{}).Count(&count).Error; err != nil {
		return err
	}

	if count == 0 {
		templates := DefaultSummaryTemplates()
		for _, tpl := range templates {
			if err := db.Create(tpl).Error; err != nil {
				logger.Error("Failed to seed summary template", "name", tpl.Name, "error", err)
				return err
			}
			logger.Info("Created summary template", "name", tpl.Name)
		}
	} else {
		logger.Debug("Summary templates already exist, skipping seed")
	}

	return nil
}
