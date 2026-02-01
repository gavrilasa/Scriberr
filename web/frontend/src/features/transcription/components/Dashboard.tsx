import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioRecorder } from "@/components/audio/AudioRecorder";
import { Header } from "@/components/Header";
import { MainLayout } from "@/components/layout/MainLayout";
import { AudioFilesTable } from "./AudioFilesTable";
import { DragDropOverlay } from "@/components/DragDropOverlay";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Mic, Upload } from "lucide-react";
import {
	groupFiles,
	convertToFileWithType,
	prepareMultiTrackFiles,
	hasValidFiles,
	getFileDescription,
	validateMultiTrackFiles
} from "@/utils/fileProcessor";
import { useGlobalUpload } from "@/contexts/GlobalUploadContext";
import { cn } from "@/lib/utils";

export function Dashboard() {
	// Get upload functionality from global context
	const {
		handleFileSelect,
		openMultiTrackDialog,
		isUploading,
		uploadProgress,
	} = useGlobalUpload();

	// Local state
    const [isRecordingMode, setIsRecordingMode] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Drag and drop state (dashboard-specific UI)
	const [isDragging, setIsDragging] = useState(false);
	const [dragCount, setDragCount] = useState(0);
	const [draggedFileGroup, setDraggedFileGroup] = useState<ReturnType<typeof groupFiles> | null>(null);
	const dragCounter = useRef(0);

	const handleTranscribe = () => {
		// Table auto-refreshes when transcription starts via query invalidation
	};

	const dismissProgress = () => {
		// Progress is managed by global context, but we can trigger a refresh
		// by updating dependencies. For now, progress auto-dismisses.
	};

	const handleRecordClick = () => {
		setIsRecordingMode(true);
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const fileList = Array.from(files);
			// Process files to determine if they are video or audio
			// Since we're using a generic file input, we assume standard processing
			const processedFiles = convertToFileWithType(fileList, false); 
			// Note: Dashboard upload implies generic handling, video detection internal to fileProcessor if needed
			// But for now simple handling:
			await handleFileSelect(processedFiles);
		}
		// Reset input value to allow selecting same file again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Global drag and drop handlers
	useEffect(() => {
		const handleWindowDragEnter = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current++;

			if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
				setIsDragging(true);
				setDragCount(dragCounter.current);

				// Preview files being dragged
				const files = Array.from(e.dataTransfer.items)
					.filter(item => item.kind === 'file')
					.map(item => item.getAsFile())
					.filter((file): file is File => file !== null);

				if (files.length > 0) {
					const fileGroup = groupFiles(files);
					setDraggedFileGroup(fileGroup);
				}
			}
		};

		const handleWindowDragLeave = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			dragCounter.current--;

			if (dragCounter.current === 0) {
				setIsDragging(false);
				setDragCount(0);
				setDraggedFileGroup(null);
			}
		};

		const handleWindowDragOver = (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
		};

		const handleWindowDrop = async (e: DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			// Reset drag state
			dragCounter.current = 0;
			setIsDragging(false);
			setDragCount(0);
			setDraggedFileGroup(null);

			if (e.dataTransfer?.files) {
				const files = Array.from(e.dataTransfer.files);
				if (files.length === 0) return;

				const fileGroup = groupFiles(files);

				// Validate files
				if (!hasValidFiles(fileGroup)) {
					console.error('Invalid files dropped');
					return;
				}

				// Handle different file types
				if (fileGroup.type === 'multitrack') {
					const multiTrackFiles = prepareMultiTrackFiles(fileGroup);
					if (multiTrackFiles) {
						// Open the global multi-track dialog
						openMultiTrackDialog();
					}
				} else if (fileGroup.type === 'video') {
					const filesWithType = convertToFileWithType(fileGroup.files, true);
					await handleFileSelect(filesWithType);
				} else {
					await handleFileSelect(fileGroup.files);
				}
			}
		};

		window.addEventListener('dragenter', handleWindowDragEnter);
		window.addEventListener('dragleave', handleWindowDragLeave);
		window.addEventListener('dragover', handleWindowDragOver);
		window.addEventListener('drop', handleWindowDrop);

		return () => {
			window.removeEventListener('dragenter', handleWindowDragEnter);
			window.removeEventListener('dragleave', handleWindowDragLeave);
			window.removeEventListener('dragover', handleWindowDragOver);
			window.removeEventListener('drop', handleWindowDrop);
		};
	}, [handleFileSelect, openMultiTrackDialog]);

	return (
		<MainLayout
			className="min-h-screen bg-[var(--bg-main)]"
			header={<Header />}
		>
			{/* Quick Actions Section */}
            <div className="mb-8 relative min-h-[140px]">
                <AnimatePresence mode="wait">
                    {!isRecordingMode ? (
                        <motion.div 
                            key="actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <button
                                onClick={handleRecordClick}
                                className={cn(
                                    "group relative flex items-center p-6 gap-5 overflow-hidden",
                                    "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10",
                                    "border border-emerald-500/20 hover:border-emerald-500/30",
                                    "rounded-[var(--radius-card)] transition-all duration-300",
                                    "hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] hover:-translate-y-1"
                                )}
                            >
                                <div className="relative p-4 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 ring-1 ring-emerald-500/20">
                                    <Mic className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col items-start z-10">
                                    <span className="text-xl font-bold text-[var(--text-primary)] group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Record Audio</span>
                                    <span className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Capture directly from microphone</span>
                                </div>
                                {/* Decorative background element */}
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500" />
                            </button>

                            <button
                                onClick={handleUploadClick}
                                className={cn(
                                    "group relative flex items-center p-6 gap-5 overflow-hidden",
                                    "bg-gradient-to-br from-[var(--brand-solid)]/10 to-[var(--brand-solid)]/5 hover:from-[var(--brand-solid)]/20 hover:to-[var(--brand-solid)]/10",
                                    "border border-[var(--brand-solid)]/20 hover:border-[var(--brand-solid)]/30",
                                    "rounded-[var(--radius-card)] transition-all duration-300",
                                    "hover:shadow-[0_8px_30px_rgba(var(--brand-solid-rgb),0.12)] hover:-translate-y-1"
                                )}
                            >
                                <div className="relative p-4 rounded-xl bg-[var(--brand-solid)]/20 text-[var(--brand-solid)] group-hover:scale-110 transition-transform duration-300 ring-1 ring-[var(--brand-solid)]/20">
                                    <Upload className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col items-start z-10">
                                    <span className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-dark)] dark:group-hover:text-[var(--brand-light)] transition-colors">Upload Files</span>
                                    <span className="text-sm text-[var(--text-secondary)] mt-1 font-medium">Drag & drop or select audio/video</span>
                                </div>
                                {/* Decorative background element */}
                                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[var(--brand-solid)]/5 rounded-full blur-2xl group-hover:bg-[var(--brand-solid)]/10 transition-colors duration-500" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="recorder"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                        >
                            <AudioRecorder onCancel={() => setIsRecordingMode(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

			{/* Upload Progress */}
			{uploadProgress.length > 0 && (
				<div className="mb-8 glass-card rounded-[var(--radius-card)] p-6 sm:p-8 shadow-[var(--shadow-float)] border border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-4 duration-500">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
							Uploading Files ({uploadProgress.filter(p => p.status === 'success').length}/{uploadProgress.length})
						</h3>
						{!isUploading && (
							<Button
								variant="ghost"
								size="icon"
								onClick={dismissProgress}
								className="h-8 w-8"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Overall progress */}
					<div className="mb-6">
						<Progress
							value={(uploadProgress.filter(p => p.status !== 'uploading').length / uploadProgress.length) * 100}
							className="h-2 bg-[var(--secondary)]"
							indicatorClassName="bg-gradient-to-r from-[var(--brand-solid)] to-[var(--brand-solid)]"
						/>
					</div>

					{/* Individual file progress */}
					<div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
						{uploadProgress.map((progress, index) => (
							<div key={index} className="flex items-center gap-4 text-sm p-3 rounded-[var(--radius-btn)] bg-[var(--bg-main)] border border-[var(--border-subtle)]">
								<div className="flex-shrink-0">
									{progress.status === 'uploading' && (
										<div className="w-4 h-4 border-2 border-[var(--brand-solid)] border-t-transparent rounded-full animate-spin" />
									)}
									{progress.status === 'success' && (
										<CheckCircle className="w-4 h-4 text-[var(--success)]" />
									)}
									{progress.status === 'error' && (
										<AlertCircle className="w-4 h-4 text-[var(--error)]" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="truncate font-medium text-[var(--text-primary)]">
										{progress.fileName}
									</div>
									{progress.error && (
										<div className="text-[var(--error)] text-xs mt-0.5">
											{progress.error}
										</div>
									)}
								</div>
								<div className="flex-shrink-0 text-xs font-medium text-[var(--text-tertiary)]">
									{progress.status === 'uploading' && 'Uploading...'}
									{progress.status === 'success' && 'Completed'}
									{progress.status === 'error' && 'Failed'}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<AudioFilesTable
				onTranscribe={handleTranscribe}
			/>


			{/* Drag and Drop Overlay */}
			<DragDropOverlay
				isDragging={isDragging}
				dragCount={dragCount}
				fileType={draggedFileGroup?.type}
				fileDescription={draggedFileGroup ? getFileDescription(draggedFileGroup) : undefined}
				errorMessage={draggedFileGroup && !hasValidFiles(draggedFileGroup)
					? (draggedFileGroup.type === 'multitrack'
						? validateMultiTrackFiles([...draggedFileGroup.files, draggedFileGroup.aupFile!]).error
						: "No supported files found")
					: undefined}
			/>

			{/* Check if Header uses similar hidden input approach or if we need to add it here. */}
			{/* Since we use handleFileSelect directly in drag/drop, we just need input for click */}
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				multiple
				accept="audio/*,video/*,.aup3"
				onChange={handleFileChange}
			/>
		</MainLayout>
	);
}
