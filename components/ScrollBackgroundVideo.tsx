'use client';

import { useEffect, useRef } from 'react';

const LERP_FACTOR = 0.16;
const MIN_CAPTURE_STEP_SEC = 0.065; // ~150 frames for a 10s video
const MIN_LIVE_SEEK_DELTA = 0.025;
const MAX_EXTRACT_WIDTH = 960;

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number }) => void
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/**
 * Draws a video or ImageBitmap centered using object-cover scaling,
 * cropping symmetrically left/right (9%) and slightly more on the bottom (9%)
 * so the subject stays centered while removing the bottom-right watermark.
 */
function drawCenteredCroppedCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | ImageBitmap,
  srcW: number,
  srcH: number,
  destW: number,
  destH: number
) {
  if (!srcW || !srcH || !destW || !destH) return;

  // Symmetric 12% left/right crop (exact 50% horizontal center) and 17% bottom crop
  // so the bottom-right Gemini watermark is completely outside the visible frame.
  const sx = srcW * 0.12;
  const sy = srcH * 0.01;
  const sw = srcW * 0.76;
  const sh = srcH * 0.82;

  const srcAspect = sw / sh;
  const destAspect = destW / destH;

  let drawX = sx;
  let drawY = sy;
  let drawW = sw;
  let drawH = sh;

  if (destAspect > srcAspect) {
    drawH = sw / destAspect;
    drawY = sy + (sh - drawH) * 0.5;
  } else {
    drawW = sh * destAspect;
    drawX = sx + (sw - drawW) * 0.5;
  }

  ctx.clearRect(0, 0, destW, destH);
  ctx.drawImage(source, drawX, drawY, drawW, drawH, 0, 0, destW, destH);
}

export default function ScrollBackgroundVideo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetProgressRef = useRef(0);
  const smoothedProgressRef = useRef(0);
  const maxScrollRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;
    let objectUrl: string | null = null;
    let frames: ImageBitmap[] = [];
    let framesReady = false;
    let lastDrawnFrameIdx = -1;
    let rvfcHandle: number | null = null;

    const liveVideo = document.createElement('video');
    liveVideo.muted = true;
    liveVideo.playsInline = true;
    liveVideo.preload = 'auto';

    const cacheVideo = document.createElement('video') as VideoWithRVFC;
    cacheVideo.muted = true;
    cacheVideo.playsInline = true;
    cacheVideo.preload = 'auto';

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    const syncCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
      lastDrawnFrameIdx = -1;
    };

    const updateMaxScroll = () => {
      maxScrollRef.current = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };

    const updateTargetProgress = () => {
      if (prefersReducedMotion) {
        targetProgressRef.current = 0;
        return;
      }
      const maxScroll = maxScrollRef.current;
      const raw = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      targetProgressRef.current = Math.min(1, Math.max(0, raw));
    };

    const drawLiveVideoFrame = () => {
      if (liveVideo.readyState >= 2 && liveVideo.videoWidth > 0) {
        drawCenteredCroppedCover(
          ctx,
          liveVideo,
          liveVideo.videoWidth,
          liveVideo.videoHeight,
          canvas.width,
          canvas.height
        );
      }
    };

    const startSequentialFrameCapture = () => {
      if (prefersReducedMotion || cancelled) return;
      if (!Number.isFinite(cacheVideo.duration) || cacheVideo.duration <= 0) {
        return;
      }

      const scale = Math.min(1, MAX_EXTRACT_WIDTH / cacheVideo.videoWidth);
      const offW = Math.max(1, Math.round(cacheVideo.videoWidth * scale));
      const offH = Math.max(1, Math.round(cacheVideo.videoHeight * scale));
      const offscreen = document.createElement('canvas');
      offscreen.width = offW;
      offscreen.height = offH;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      const safeEnd = Math.max(0.1, cacheVideo.duration - 0.12);
      const captured: ImageBitmap[] = [];
      let lastCapturedTime = -1;
      let captureFinished = false;

      const finalizeCapture = () => {
        if (captureFinished || cancelled) return;
        captureFinished = true;
        cacheVideo.pause();
        if (rvfcHandle !== null && cacheVideo.cancelVideoFrameCallback) {
          cacheVideo.cancelVideoFrameCallback(rvfcHandle);
          rvfcHandle = null;
        }
        if (captured.length > 8) {
          frames = captured;
          framesReady = true;
          lastDrawnFrameIdx = -1;
        } else {
          captured.forEach((b) => b.close());
        }
      };

      const captureCurrentFrame = async () => {
        if (captureFinished || cancelled) return;
        const current = cacheVideo.currentTime;
        if (current - lastCapturedTime >= MIN_CAPTURE_STEP_SEC || lastCapturedTime < 0) {
          lastCapturedTime = current;
          offCtx.drawImage(cacheVideo, 0, 0, offW, offH);
          try {
            const bitmap = await createImageBitmap(offscreen);
            if (cancelled || captureFinished) {
              bitmap.close();
              return;
            }
            captured.push(bitmap);
          } catch {
            // Ignore transient frame capture errors
          }
        }
        if (current >= safeEnd || cacheVideo.ended) {
          finalizeCapture();
        }
      };

      cacheVideo.currentTime = 0;
      cacheVideo.playbackRate = 4;

      if (typeof cacheVideo.requestVideoFrameCallback === 'function') {
        const onVideoFrame = () => {
          if (captureFinished || cancelled) return;
          void captureCurrentFrame().then(() => {
            if (!captureFinished && !cancelled && cacheVideo.requestVideoFrameCallback) {
              rvfcHandle = cacheVideo.requestVideoFrameCallback(onVideoFrame);
            }
          });
        };
        rvfcHandle = cacheVideo.requestVideoFrameCallback(onVideoFrame);
      } else {
        const pollCapture = () => {
          if (captureFinished || cancelled) return;
          void captureCurrentFrame();
          window.requestAnimationFrame(pollCapture);
        };
        window.requestAnimationFrame(pollCapture);
      }

      cacheVideo.addEventListener('ended', finalizeCapture, { once: true });
      void cacheVideo.play().catch(() => {
        finalizeCapture();
      });
    };

    const handleLiveLoadedData = () => {
      if (cancelled) return;
      liveVideo.pause();
      updateMaxScroll();
      updateTargetProgress();
      smoothedProgressRef.current = targetProgressRef.current;

      if (
        Number.isFinite(liveVideo.duration) &&
        liveVideo.duration > 0 &&
        !liveVideo.seeking
      ) {
        const safeDur = Math.max(0.1, liveVideo.duration - 0.12);
        liveVideo.currentTime = targetProgressRef.current * safeDur;
      }
      drawLiveVideoFrame();
    };

    const handleLiveSeeked = () => {
      if (!framesReady && !cancelled) {
        drawLiveVideoFrame();
      }
    };

    const handleScroll = () => {
      updateMaxScroll();
      updateTargetProgress();
    };

    const handleResize = () => {
      syncCanvasSize();
      updateMaxScroll();
      updateTargetProgress();
      if (!framesReady) {
        drawLiveVideoFrame();
      }
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        targetProgressRef.current = 0;
        smoothedProgressRef.current = 0;
        lastDrawnFrameIdx = -1;
        if (!framesReady && liveVideo.readyState >= 2 && !liveVideo.seeking) {
          liveVideo.currentTime = 0;
        }
      } else {
        updateTargetProgress();
      }
    };

    const tick = () => {
      const target = prefersReducedMotion ? 0 : targetProgressRef.current;
      const diff = target - smoothedProgressRef.current;

      if (Math.abs(diff) < 0.0006) {
        smoothedProgressRef.current = target;
      } else {
        smoothedProgressRef.current += diff * LERP_FACTOR;
      }

      const clamped = Math.min(1, Math.max(0, smoothedProgressRef.current));

      if (framesReady && frames.length > 0) {
        const frameIdx = Math.min(
          frames.length - 1,
          Math.max(0, Math.round(clamped * (frames.length - 1)))
        );

        if (frameIdx !== lastDrawnFrameIdx) {
          const frame = frames[frameIdx];
          drawCenteredCroppedCover(
            ctx,
            frame,
            frame.width,
            frame.height,
            canvas.width,
            canvas.height
          );
          lastDrawnFrameIdx = frameIdx;
        }
      } else if (
        !prefersReducedMotion &&
        liveVideo.readyState >= 2 &&
        Number.isFinite(liveVideo.duration) &&
        liveVideo.duration > 0 &&
        !liveVideo.seeking
      ) {
        const safeDur = Math.max(0.1, liveVideo.duration - 0.12);
        const nextTime = clamped * safeDur;
        if (Math.abs(nextTime - liveVideo.currentTime) > MIN_LIVE_SEEK_DELTA) {
          liveVideo.currentTime = nextTime;
        }
      }

      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    syncCanvasSize();
    updateMaxScroll();

    liveVideo.addEventListener('loadeddata', handleLiveLoadedData, { once: true });
    liveVideo.addEventListener('seeked', handleLiveSeeked);
    cacheVideo.addEventListener('loadeddata', startSequentialFrameCapture, {
      once: true,
    });

    // Preload MP4 once into memory so both live scrubbing and sequential capture have zero network latency
    fetch('/videos/walking-bg.mp4')
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (cancelled) return;
        const src = blob ? URL.createObjectURL(blob) : '/videos/walking-bg.mp4';
        if (blob) objectUrl = src;
        liveVideo.src = src;
        cacheVideo.src = src;
        liveVideo.load();
        cacheVideo.load();
      })
      .catch(() => {
        if (cancelled) return;
        liveVideo.src = '/videos/walking-bg.mp4';
        cacheVideo.src = '/videos/walking-bg.mp4';
        liveVideo.load();
        cacheVideo.load();
      });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    motionQuery.addEventListener('change', handleMotionChange);

    const resizeObserver = new ResizeObserver(() => {
      updateMaxScroll();
      updateTargetProgress();
    });
    resizeObserver.observe(document.body);

    rafIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      if (rvfcHandle !== null && cacheVideo.cancelVideoFrameCallback) {
        cacheVideo.cancelVideoFrameCallback(rvfcHandle);
      }
      resizeObserver.disconnect();
      liveVideo.removeEventListener('loadeddata', handleLiveLoadedData);
      liveVideo.removeEventListener('seeked', handleLiveSeeked);
      cacheVideo.removeEventListener('loadeddata', startSequentialFrameCapture);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
      frames.forEach((b) => b.close());
      frames = [];
      liveVideo.pause();
      cacheVideo.pause();
      liveVideo.src = '';
      cacheVideo.src = '';
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[#FAF9F6]/35 transition-colors duration-300 dark:bg-[#0F0E0D]/45"
      />
    </>
  );
}
