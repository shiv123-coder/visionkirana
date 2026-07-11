import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface LiveAudioRecorderProps {
  onAudioReady: (file: File) => void;
  isUploading?: boolean;
  isSuccess?: boolean;
  onRemove?: () => void;
}

export function LiveAudioRecorder({ onAudioReady, isUploading = false, isSuccess = false, onRemove }: LiveAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert Blob to File
        const file = new File([audioBlob], `recording-${new Date().getTime()}.webm`, {
          type: "audio/webm",
        });
        setAudioFile(file);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or unavailable. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDiscard = () => {
    setAudioUrl(null);
    setAudioFile(null);
    setRecordingTime(0);
  };

  const handleSubmit = () => {
    if (audioFile) {
      onAudioReady(audioFile);
    }
  };

  return (
    <div className="w-full relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 ease-out overflow-hidden bg-background/40 backdrop-blur-md shadow-sm border-indigo-500/30">
      
      {isSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-4"
        >
          <div className="p-4 bg-green-500/10 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Upload Complete</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Your voice pitch has been securely saved.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              if (onRemove) onRemove();
              handleDiscard();
            }}
            className="text-destructive hover:bg-destructive/10 border-destructive/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete & Re-record
          </Button>
        </motion.div>
      ) : !audioUrl ? (
        <div className="flex flex-col items-center w-full">
          
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 flex flex-col items-center"
              >
                <div className="text-3xl font-mono text-indigo-500 tracking-wider font-bold mb-2">
                  {formatTime(recordingTime)}
                </div>
                <div className="flex items-center space-x-2 text-indigo-500 font-medium text-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <span>Recording Live...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isRecording ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 shadow-[0_0_2rem_-0.5rem_rgba(99,102,241,0.4)] flex flex-col items-center justify-center space-y-2 transition-all duration-300"
                variant="outline"
              >
                <Mic className="w-8 h-8" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 shadow-[0_0_2rem_-0.5rem_rgba(239,68,68,0.4)] flex flex-col items-center justify-center space-y-2 transition-all duration-300"
                variant="outline"
              >
                <Square className="w-8 h-8 fill-destructive" />
              </Button>
            </motion.div>
          )}

          {!isRecording && (
            <p className="mt-6 text-sm font-medium text-foreground/80">Click to start recording</p>
          )}
          
          {error && (
            <div className="mt-4 text-xs text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-md max-w-sm text-center">
              {error}
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center"
        >
          <div className="w-full bg-background/50 rounded-xl p-4 border border-border mb-6 shadow-inner">
            <audio src={audioUrl} controls className="w-full" />
          </div>
          
          <div className="flex space-x-4 w-full">
            <Button 
              variant="outline" 
              className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleDiscard}
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button 
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_1rem_-0.25rem_rgba(99,102,241,0.5)]"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use This Recording
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
