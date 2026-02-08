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
			Name:        "Catatan SOAP Psikologi",
			Description: ptrString("Buat catatan SOAP terstruktur dari transkrip konsultasi psikologi"),
			Model:       "gpt-4o-mini",
			Prompt: `Anda adalah asisten dokumentasi klinis untuk konsultasi psikologi. Analisis transkrip berikut dan buat catatan SOAP terstruktur mengikuti standar dokumentasi medis.

## FORMAT SOAP

### S - Subjective (Subjektif)
Dokumentasikan informasi yang dilaporkan sendiri oleh pasien:
- Keluhan utama dan masalah yang muncul
- Riwayat penyakit saat ini (HPI)
- Deskripsi pasien tentang gejala, perasaan, dan pengalaman
- Riwayat psikososial relevan yang disebutkan
- Tujuan terapi pasien

### O - Objective (Objektif)
Dokumentasikan temuan yang dapat diamati dan diukur:
- Observasi pemeriksaan status mental (penampilan, perilaku, afek, suasana hati, bicara, proses berpikir)
- Observasi perilaku selama sesi
- Observasi objektif klinisi
- Skor penilaian atau hasil tes yang disebutkan

### A - Assessment (Penilaian)
Berikan interpretasi klinis:
- Kesan klinis dan pertimbangan diagnostik
- Kemajuan menuju tujuan pengobatan
- Penilaian risiko (ide bunuh diri/pembunuhan, menyakiti diri sendiri)
- Tingkat gangguan fungsional
- Penilaian aliansi terapeutik

### P - Plan (Perencanaan)
Dokumentasikan rencana perawatan:
- Intervensi yang digunakan dalam sesi ini
- Pekerjaan rumah atau tugas yang diberikan
- Modifikasi rencana perawatan
- Rujukan atau konsultasi yang dibutuhkan
- Janji temu berikutnya dan tujuan sesi
- Perencanaan keselamatan jika berlaku

---

**Panduan Penting:**
- Gunakan bahasa klinis profesional (Bahasa Indonesia)
- Ringkas namun menyeluruh
- Pertahankan standar kerahasiaan pasien
- Catat masalah keamanan secara mencolok
- Sertakan kutipan langsung jika relevan secara klinis (ditandai dengan tanda kutip)

TRANSCRIPT:
{{transcript}}`,
		},
	}
}


