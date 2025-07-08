import { useRef } from "react";

export interface RTCApi {
  addIceCandidate: (candidate: RTCIceCandidate) => void;
  addSessionDescription: (session: RTCSessionDescriptionInit) => void;
  startCall: () => void;
  endCall: () => void;
}

interface Props {
  isOffering: boolean;
  // Channels
  useVideo: boolean;
  useAudio: boolean;
  useData: boolean;
  // Configuration
  config: RTCConfiguration;
  // Events
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onSessionDescription: (session: RTCSessionDescriptionInit) => void;
  onError?: (error: string) => void;
}

function RTCApi({
  isOffering,
  useVideo,
  useAudio,
  useData,
  config,
  onLocalStream,
  onRemoteStream,
  onIceCandidate,
  onSessionDescription,
  onError,
}: Props): RTCApi {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const initializePeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection(config);

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Remote track received");

      event.streams.forEach((stream) => {
        onRemoteStream(stream);
      });
    };

    if (useData) {
      const dataChannel = pc.createDataChannel("messages");
      dataChannel.onopen = () => console.log("Data channel opened");
      dataChannel.onmessage = (event) => {
        console.log("Message received:", event.data);
      };
      dataChannelRef.current = dataChannel;
    }

    return pc;
  };

  // Get user media
  const getUserMedia = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: useVideo,
        audio: useAudio,
      });

      return stream;
    } catch (err) {
      const errorMsg = `Error accessing media devices: ${err}`;
      onError?.(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const startCall = async () => {
    try {
      const stream = await getUserMedia();
      onLocalStream(stream);

      const pc = initializePeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      if (isOffering) {
        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        onSessionDescription(offer);
      }

      console.log("Call started");
    } catch (err) {
      onError?.(`Failed to start call: ${err}`);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    console.log("Call ended");
  };

  const addIceCandidate = async (candidate: RTCIceCandidate) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate);
    }
  };
  const addSessionDescription = async (session: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(session);
      if (!isOffering) {
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        onSessionDescription(answer);
      }
    }
  };

  return { addIceCandidate, addSessionDescription, startCall, endCall };
}

export default RTCApi;
