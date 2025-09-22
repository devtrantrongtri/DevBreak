'use client';

import React, { useEffect, useRef, forwardRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onLoadedMetadata?: () => void;
  onError?: (error: Event) => void;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(({
  stream,
  muted = false,
  autoPlay = true,
  playsInline = true,
  style,
  className,
  onLoadedMetadata,
  onError,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Use forwarded ref or internal ref
  const videoElement = (ref as React.RefObject<HTMLVideoElement>) || videoRef;

  useEffect(() => {
    const video = videoElement.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      
      // Play the video when stream is set
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.error('Error playing video:', error);
        }
      };

      if (autoPlay) {
        playVideo();
      }
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video.srcObject) {
        video.srcObject = null;
      }
    };
  }, [stream, autoPlay, videoElement]);

  const handleLoadedMetadata = () => {
    onLoadedMetadata?.();
  };

  const handleError = (error: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video player error:', error);
    onError?.(error.nativeEvent);
  };

  return (
    <video
      ref={videoElement}
      muted={muted}
      autoPlay={autoPlay}
      playsInline={playsInline}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        backgroundColor: '#000',
        ...style,
      }}
      className={className}
      onLoadedMetadata={handleLoadedMetadata}
      onError={handleError}
    />
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
