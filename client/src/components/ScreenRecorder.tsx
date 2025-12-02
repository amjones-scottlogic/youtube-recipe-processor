import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import fixWebmDuration from 'fix-webm-duration';

interface RecorderInstance {
  mediaRecorder: MediaRecorder | null;
  chunks: Blob[];
  startTime: number;
  timer: ReturnType<typeof setTimeout> | null;
}

export function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Two recorders for overlapping cycles
  const r1 = useRef<RecorderInstance>({ mediaRecorder: null, chunks: [], startTime: 0, timer: null });
  const r2 = useRef<RecorderInstance>({ mediaRecorder: null, chunks: [], startTime: 0, timer: null });
  
  const isStartingRef = useRef(false);
  const saveRequestRef = useRef<{ id: 1 | 2 } | null>(null);
  
  const CYCLE_MS = 30000; // 30s recording cycles
  const STAGGER_MS = 15000; // Start second recorder 15s later

  const startRecording = async () => {
    if (isStartingRef.current || streamRef.current) return;
    isStartingRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: true,
        // @ts-ignore - newer properties not yet in all TS definitions
        preferCurrentTab: true,
        selfBrowserSurface: "include",
        surfaceSwitching: "include",
        systemAudio: "include"
      });

      streamRef.current = stream;
      setIsRecording(true);
      
      // Start Recorder 1 immediately
      initRecorder(1, stream);

      // Start Recorder 2 after stagger delay
      setTimeout(() => {
        if (streamRef.current?.active) {
          initRecorder(2, stream);
        }
      }, STAGGER_MS);

      // Handle stream stop (e.g. user clicks "Stop sharing" in browser UI)
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

    } catch (err) {
      console.error("Error starting screen recording:", err);
    } finally {
      isStartingRef.current = false;
    }
  };

  const initRecorder = (id: 1 | 2, stream: MediaStream) => {
    const recorderRef = id === 1 ? r1 : r2;
    
    // Clean up previous timer if any
    if (recorderRef.current.timer) clearTimeout(recorderRef.current.timer);

    // Prefer WebM for stability (fixes yellow screen issue in Chrome/MP4), fall back to MP4
    const mimeType = [
      'video/webm;codecs=vp9',
      'video/webm',
      'video/mp4'
    ].find(t => MediaRecorder.isTypeSupported(t));

    const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current.mediaRecorder = mediaRecorder;
    recorderRef.current.chunks = [];
    recorderRef.current.startTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recorderRef.current.chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Check if this stop was triggered by a save request
      if (saveRequestRef.current?.id === id) {
        const type = mediaRecorder.mimeType;
        const ext = type.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(recorderRef.current.chunks, { type });
        
        if (ext === 'webm') {
          const duration = Date.now() - recorderRef.current.startTime;
          fixWebmDuration(blob, duration, (fixedBlob: Blob) => {
            downloadBlob(fixedBlob, `replay.${ext}`);
          });
        } else {
          downloadBlob(blob, `replay.${ext}`);
        }
        saveRequestRef.current = null;
      }

      // Automatically restart if stream is still active
      if (streamRef.current?.active) {
        initRecorder(id, stream);
      }
    };

    mediaRecorder.start(1000);

    // Schedule automatic restart
    recorderRef.current.timer = setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, CYCLE_MS);
  };

  useEffect(() => {
    // Attempt to auto-start recording on mount.
    // Note: Most browsers block getDisplayMedia without a user gesture,
    // so this will likely fail and require the user to click the button.
    // We use a timeout to prevent double-invocation in React Strict Mode.
    const timer = setTimeout(() => {
      startRecording().catch(() => {
        // Silently fail on auto-start
      });
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopRecording();
    };
  }, []);

  const stopRecording = () => {
    if (r1.current.timer) clearTimeout(r1.current.timer);
    if (r2.current.timer) clearTimeout(r2.current.timer);
    
    if (r1.current.mediaRecorder?.state !== 'inactive') r1.current.mediaRecorder?.stop();
    if (r2.current.mediaRecorder?.state !== 'inactive') r2.current.mediaRecorder?.stop();
    
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  const saveReplay = () => {
    const now = Date.now();
    const dur1 = r1.current.mediaRecorder?.state === 'recording' ? now - r1.current.startTime : 0;
    const dur2 = r2.current.mediaRecorder?.state === 'recording' ? now - r2.current.startTime : 0;

    // Pick the recorder with the longest duration
    const bestId = dur1 >= dur2 ? 1 : 2;
    const bestRecorder = bestId === 1 ? r1.current : r2.current;

    if (bestRecorder.mediaRecorder && bestRecorder.mediaRecorder.state !== 'inactive') {
      // Flag this stop as a save request
      saveRequestRef.current = { id: bestId };
      
      // Stop the recorder (triggers onstop -> download -> restart)
      // We also need to clear the auto-restart timer so it doesn't fire later
      if (bestRecorder.timer) clearTimeout(bestRecorder.timer);
      bestRecorder.mediaRecorder.stop();
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    if (blob.size === 0) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `${new Date().toISOString()}-${filename}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Only show in development
  if (!import.meta.env.DEV) return null;

  return (
    <div className="flex items-center gap-4">
      {!isRecording ? (
        <button 
          onClick={startRecording}
          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-red-600"></span>
          Enable Recording
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-xs text-gray-600 font-medium">Recording Active</span>
          </div>
          <button 
            onClick={saveReplay}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 font-medium transition-colors"
          >
            Save Last 30s
          </button>
        </div>
      )}
    </div>
  );
}
