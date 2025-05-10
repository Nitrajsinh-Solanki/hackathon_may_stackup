// moodify\src\app\components\AudioVisualizer.tsx


"use client";
import React, { useEffect, useRef, useState } from "react";

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

// global map to track audio contexts and sources across components
const audioContextMap = new WeakMap<HTMLAudioElement, {
  context: AudioContext,
  source: MediaElementAudioSourceNode,
  analyser: AnalyserNode
}>();

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;
    
    const audio = audioRef.current;
    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaElementAudioSourceNode;
    
  
    if (audioContextMap.has(audio)) {
      const existing = audioContextMap.get(audio)!;
      audioCtx = existing.context;
      analyser = existing.analyser;
      source = existing.source;
      setIsSetup(true);
    } else {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        audioContextMap.set(audio, {
          context: audioCtx,
          source,
          analyser
        });
        
        setIsSetup(true);
        console.log("Audio visualizer setup complete");
      } catch (error) {
        console.error("Error setting up audio visualizer:", error);
        return;
      }
    }
    
    const resumeAudioContext = () => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().then(() => {
          console.log("AudioContext resumed successfully");
        }).catch(err => {
          console.error("Failed to resume AudioContext:", err);
        });
      }
    };
    
    // listen for play events to resume context
    audio.addEventListener("play", resumeAudioContext);
    
    const handleDocumentClick = () => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(err => console.error("Failed to resume on click:", err));
      }
    };
    
    document.addEventListener("click", handleDocumentClick, { once: true });
    
    return () => {
      audio.removeEventListener("play", resumeAudioContext);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!isSetup || !audioRef.current || !canvasRef.current) return;
    
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;
    
    // get the stored audio context and analyser
    const { analyser } = audioContextMap.get(audio)!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        
        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight / 2);
        gradient.addColorStop(0, 'rgb(139, 92, 246)'); 
        gradient.addColorStop(1, 'rgb(236, 72, 153)'); 
        
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        
        x += barWidth + 1;
      }
    };
    
    draw();
    
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isSetup, audioRef]);

  
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (audioRef.current && audioContextMap.has(audioRef.current)) {
        const { context } = audioContextMap.get(audioRef.current)!;
        if (context.state !== "closed") {
          context.close().catch(err => console.error("Error closing audio context:", err));
        }
        audioContextMap.delete(audioRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [audioRef]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-24 rounded-lg bg-gray-900/50 backdrop-blur-sm"
    />
  );
};

export default AudioVisualizer;
