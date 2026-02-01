import { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import { Mic, Square, Play, Pause, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalUpload } from "@/contexts/GlobalUploadContext";

interface AudioRecorderProps {
    onCancel: () => void;
}

export function AudioRecorder({ onCancel }: AudioRecorderProps) {
    const { handleRecordingComplete } = useGlobalUpload();

    // Recorder State
    const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
    const [record, setRecord] = useState<RecordPlugin | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const micContainerRef = useRef<HTMLDivElement>(null);

    // Initialize WaveSurfer
    useEffect(() => {
        let activeStream: MediaStream | null = null;
        let ws: WaveSurfer | null = null;

        const init = async () => {
            try {
                // Permissions
                activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });

                if (!micContainerRef.current) return;

                // Create WaveSurfer
                ws = WaveSurfer.create({
                    container: micContainerRef.current,
                    waveColor: "rgba(16, 185, 129, 0.5)", // Emerald-500 with opacity
                    progressColor: "rgb(16, 185, 129)", // Emerald-500
                    height: 60, 
                    normalize: true,
                    barWidth: 3,
                    barGap: 2,
                    barRadius: 3,
                    interact: false,
                    cursorWidth: 0,
                });

                setWavesurfer(ws);

                // Initialize Plugin
                const recordPlugin = ws.registerPlugin(
                    RecordPlugin.create({
                        renderRecordedAudio: false,
                        scrollingWaveform: true,
                        continuousWaveform: true,
                        continuousWaveformDuration: 30,
                        mediaRecorderTimeslice: 1000,
                    })
                );

                recordPlugin.on("record-end", (blob: Blob) => {
                    setRecordedBlob(blob);
                    setIsRecording(false);
                    setIsPaused(false);
                });

                recordPlugin.on("record-progress", (time: number) => {
                    setRecordingTime(time);
                });

                setRecord(recordPlugin);

            } catch (error) {
                console.error("Failed to initialize:", error);
            } finally {
                if (activeStream) activeStream.getTracks().forEach(t => t.stop());
            }
        };

        const timeoutId = setTimeout(init, 100);

        return () => {
            clearTimeout(timeoutId);
            if (ws) ws.destroy();
            if (activeStream) activeStream.getTracks().forEach(t => t.stop());
        };
    }, []);

    // Actions
    const startRecording = async () => {
        if (!record) return;
        try {
            await record.startRecording({
                channelCount: 1, 
                sampleRate: 44100
            });
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setRecordedBlob(null);
        } catch (err) {
            console.error(err);
            alert("Could not start recording. Check permissions.");
        }
    };

    const stopRecording = () => record?.stopRecording();
    
    const togglePause = () => {
        if (!record) return;
        if (isPaused) {
            record.resumeRecording();
            setIsPaused(false);
        } else {
            record.pauseRecording();
            setIsPaused(true);
        }
    };

    const handleUpload = async () => {
        if (!recordedBlob) return;
        setIsUploading(true);
        try {
            await handleRecordingComplete(
                recordedBlob,
                `Quick Recording ${new Date().toLocaleTimeString()}`
            );
            onCancel(); // Close recorder on success
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900/50 rounded-[var(--radius-card)] border border-emerald-500/20 p-6 relative overflow-hidden shadow-lg">
            {/* Ambient Background */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-20" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-6 z-10 relative">
                
                {/* Visualizer Area */}
                <div className="flex-1 w-full relative h-[80px] bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-center overflow-hidden">
                    {!wavesurfer && (
                        <div className="flex items-center gap-2 text-emerald-600/50 text-xs uppercase tracking-widest">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Initializing
                        </div>
                    )}
                     <div ref={micContainerRef} className="w-full px-4" />
                </div>

                {/* Controls Area */}
                <div className="flex items-center gap-4 shrink-0">
                    
                    {/* Timer */}
                    <div className="font-mono text-lg font-medium w-[80px] text-center text-emerald-700 dark:text-emerald-400">
                        {formatTime(recordingTime)}
                    </div>

                    {!isRecording && !recordedBlob && (
                         <Button onClick={startRecording} size="icon" className="h-12 w-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                             <Mic className="w-5 h-5" />
                         </Button>
                    )}

                    {isRecording && (
                        <>
                            <Button onClick={togglePause} size="icon" variant="outline" className="h-10 w-10 rounded-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            </Button>
                            <Button onClick={stopRecording} size="icon" className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:scale-105 transition-all">
                                <Square className="w-5 h-5" fill="currentColor" />
                            </Button>
                        </>
                    )}

                    {recordedBlob && (
                        <>
                             <Button onClick={handleUpload} disabled={isUploading} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                {isUploading ? "Uploading..." : "Save"}
                             </Button>
                             <Button onClick={() => { setRecordedBlob(null); setRecordingTime(0); }} size="icon" variant="ghost" className="h-10 w-10 rounded-full text-zinc-400 hover:text-red-500">
                                <X className="w-5 h-5" />
                             </Button>
                        </>
                    )}

                    {!isRecording && !recordedBlob && (
                         <Button onClick={onCancel} size="icon" variant="ghost" className="h-10 w-10 rounded-full text-zinc-400 hover:text-zinc-600">
                             <X className="w-5 h-5" />
                         </Button>
                    )}

                </div>
            </div>
        </div>
    );
}
