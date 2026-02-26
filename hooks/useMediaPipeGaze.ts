'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { computeGazeFromLandmarks } from '@/lib/gaze/computeGaze';
import type { GazeEvent } from '@/lib/gaze/computeGaze';

export type { GazeEvent };

interface UseMediaPipeGazeProps {
  onGaze: (event: GazeEvent) => void;
  drawOverlays?: boolean;
}

export function useMediaPipeGaze({ onGaze, drawOverlays = true }: UseMediaPipeGazeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [fps, setFps] = useState(0);

  // ─── Use ref for callback to avoid stale closure in RAF loop ───
  const onGazeRef = useRef(onGaze);
  useEffect(() => { onGazeRef.current = onGaze; }, [onGaze]);

  const drawOverlaysRef = useRef(drawOverlays);
  useEffect(() => { drawOverlaysRef.current = drawOverlays; }, [drawOverlays]);

  const start = useCallback(async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      refineLandmarks: true,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 1280, height: 720 }
    });
    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }

    let frameCount = 0;
    let lastTime = performance.now();

    const processFrame = (timestamp: number) => {
      if (!landmarkerRef.current || !videoRef.current) return;

      const results = landmarkerRef.current.detectForVideo(videoRef.current, timestamp);

      if (results.faceLandmarks?.[0]) {
        const landmarks = results.faceLandmarks[0];
        const event = computeGazeFromLandmarks(landmarks);
        // Use ref to always call the latest callback (avoids stale closure)
        onGazeRef.current(event);

        // Canvas overlays: blue iris circles, orange nose dot, red dashed gaze vectors
        if (drawOverlaysRef.current && canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d')!;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const w = canvas.width;
          const h = canvas.height;

          // Blue iris circles
          const drawUtils = new DrawingUtils(ctx);
          drawUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: '#3b82f6', lineWidth: 3 });
          drawUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: '#3b82f6', lineWidth: 3 });

          // Larger blue iris center dots
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath(); ctx.arc(landmarks[468].x * w, landmarks[468].y * h, 10, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(landmarks[473].x * w, landmarks[473].y * h, 10, 0, Math.PI * 2); ctx.fill();

          // Orange nose dot
          const nose = landmarks[168];
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(nose.x * w, nose.y * h, 7, 0, Math.PI * 2);
          ctx.fill();

          // Red dashed gaze vector
          ctx.strokeStyle = '#ef4444';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(landmarks[33].x * w, landmarks[33].y * h);
          ctx.lineTo(
            (landmarks[468].x + event.gazePoint.x * 0.2) * w,
            (landmarks[468].y - event.gazePoint.y * 0.2) * h
          );
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      frameCount++;
      if (timestamp - lastTime > 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = timestamp;
      }

      rafRef.current = requestAnimationFrame(processFrame);
    };

    rafRef.current = requestAnimationFrame(processFrame);
    setIsLive(true);
  }, []); // No deps needed — uses refs for callbacks

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsLive(false);
    setFps(0);
  }, []);

  return { videoRef, canvasRef, start, stop, isLive, fps };
}
