'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { WebRTCOffer, WebRTCAnswer, WebRTCIceCandidate } from '@/types/meeting';

interface UseWebRTCOptions {
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: string) => void;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  peerConnection: RTCPeerConnection | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  connectionState: RTCPeerConnectionState;
  startLocalStream: (video?: boolean, audio?: boolean) => Promise<void>;
  stopLocalStream: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  createOffer: () => Promise<WebRTCOffer>;
  createAnswer: (offer: WebRTCOffer) => Promise<WebRTCAnswer>;
  setRemoteDescription: (answer: WebRTCAnswer) => Promise<void>;
  addIceCandidate: (candidate: WebRTCIceCandidate) => Promise<void>;
  cleanup: () => void;
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useWebRTC = ({
  onRemoteStream,
  onConnectionStateChange,
  onError,
}: UseWebRTCOptions = {}): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const originalStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10,
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📡 Received remote track:', event.track.kind);
      const [stream] = event.streams;
      setRemoteStream(stream);
      onRemoteStream?.(stream);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔗 Connection state changed:', pc.connectionState);
      setConnectionState(pc.connectionState);
      onConnectionStateChange?.(pc.connectionState);

      if (pc.connectionState === 'failed') {
        onError?.('WebRTC connection failed');
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', pc.iceGatheringState);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onRemoteStream, onConnectionStateChange, onError]);

  const startLocalStream = useCallback(async (video = true, audio = true) => {
    try {
      console.log('🎥 Starting local stream...');
      
      const constraints: MediaStreamConstraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      originalStreamRef.current = stream;
      setIsVideoEnabled(video);
      setIsAudioEnabled(audio);

      // Add tracks to peer connection
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      console.log('✅ Local stream started successfully');
    } catch (error) {
      console.error('❌ Error starting local stream:', error);
      onError?.(`Failed to start camera/microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []); // ✅ Loại bỏ dependencies không ổn định

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
      setLocalStream(null);
    }
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      originalStreamRef.current = null;
    }
    setIsScreenSharing(false);
  }, []); // ✅ Sử dụng ref thay vì state dependency

  const toggleVideo = useCallback(() => {
    // Sử dụng ref để tránh dependency
    const stream = originalStreamRef.current;
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []); // ✅ Không cần dependencies

  const toggleAudio = useCallback(() => {
    // Sử dụng ref để tránh dependency
    const stream = originalStreamRef.current;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []); // ✅ Không cần dependencies

  const startScreenShare = useCallback(async () => {
    try {
      console.log('🖥️ Starting screen share...');
      
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace video track in peer connection
      const pc = peerConnectionRef.current;
      if (pc && localStream) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      // Update local stream with screen share
      const currentStream = originalStreamRef.current;
      const audioTrack = currentStream?.getAudioTracks()[0];
      const newStream = new MediaStream([screenStream.getVideoTracks()[0]]);
      if (audioTrack) {
        newStream.addTrack(audioTrack);
      }

      setLocalStream(newStream);
      setIsScreenSharing(true);
      
      console.log('✅ Screen share started successfully');
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      onError?.(`Failed to start screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []); // ✅ Loại bỏ dependencies

  const stopScreenShare = useCallback(async () => {
    try {
      console.log('🖥️ Stopping screen share...');
      
      if (originalStreamRef.current) {
        // Replace screen share with original camera
        const pc = peerConnectionRef.current;
        if (pc) {
          const videoTrack = originalStreamRef.current.getVideoTracks()[0];
          const sender = pc.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }

        setLocalStream(originalStreamRef.current);
      }
      
      setIsScreenSharing(false);
      console.log('✅ Screen share stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
      onError?.(`Failed to stop screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []); // ✅ Loại bỏ onError dependency

  const createOffer = useCallback(async (): Promise<WebRTCOffer> => {
    const pc = createPeerConnection();
    
    try {
      console.log('📤 Creating WebRTC offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await pc.setLocalDescription(offer);
      
      console.log('✅ WebRTC offer created successfully');
      return {
        type: 'offer',
        sdp: offer.sdp!,
      };
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw new Error(`Failed to create offer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []); // ✅ Loại bỏ createPeerConnection dependency

  const createAnswer = useCallback(async (offer: WebRTCOffer): Promise<WebRTCAnswer> => {
    const pc = createPeerConnection();
    
    try {
      console.log('📥 Creating WebRTC answer...');
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('✅ WebRTC answer created successfully');
      return {
        type: 'answer',
        sdp: answer.sdp!,
      };
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      throw new Error(`Failed to create answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []); // ✅ Loại bỏ createPeerConnection dependency

  const setRemoteDescription = useCallback(async (answer: WebRTCAnswer): Promise<void> => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      throw new Error('Peer connection not initialized');
    }
    
    try {
      console.log('📥 Setting remote description...');
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote description set successfully');
    } catch (error) {
      console.error('❌ Error setting remote description:', error);
      throw new Error(`Failed to set remote description: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: WebRTCIceCandidate): Promise<void> => {
    const pc = peerConnectionRef.current;
    if (!pc) {
      console.warn('⚠️ Peer connection not initialized, ignoring ICE candidate');
      return;
    }
    
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added successfully');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
      // Don't throw here as ICE candidates can fail and that's normal
    }
  }, []);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebRTC resources...');
    
    // Sử dụng ref thay vì gọi function
    if (originalStreamRef.current) {
      originalStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      originalStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('closed');
    setIsScreenSharing(false);
  }, []); // ✅ Không cần dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []); // ✅ Chỉ chạy một lần khi unmount

  return {
    localStream,
    remoteStream,
    peerConnection: peerConnectionRef.current,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    connectionState,
    startLocalStream,
    stopLocalStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    cleanup,
  };
};
