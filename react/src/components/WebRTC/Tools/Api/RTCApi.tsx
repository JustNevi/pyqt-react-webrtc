import { useRef } from "react";

export interface RTCApi {
  startCall: () => void;
  endCall: () => void;
  addIceCandidate: (candidate: RTCIceCandidate) => void;
  addSessionDescription: (session: RTCSessionDescriptionInit) => void;
  sendData: (data: string) => void;
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
  onDataMessage: (data: string) => void;
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
  onDataMessage,
  onError,
}: Props): RTCApi {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => {
      console.log("Data channel opened:", channel.label);
      dataChannelRef.current = channel; // Store the active data channel
    };
    channel.onmessage = (event) => {
      console.log("Message received:", event.data);
      onDataMessage(event.data); // Pass received message to callback
    };
    channel.onclose = () => {
      console.log("Data channel closed:", channel.label);
      if (dataChannelRef.current === channel) {
        dataChannelRef.current = null;
      }
    };
    channel.onerror = (error) => {
      console.error("Data channel error:", channel.label, error);
      onError?.(`Data channel error: ${error}`);
    };
  };

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
      pc.ondatachannel = (event) => {
        console.log("Remote data channel received:", event.channel.label);
        setupDataChannel(event.channel);
      };

      if (isOffering) {
        const dataChannel = pc.createDataChannel("message-channel", {});
        setupDataChannel(dataChannel);
        dataChannelRef.current = dataChannel;
      }
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

  const sendData = (data: string) => {
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(data);
      console.log("Message sent:", data);
    } else {
      console.warn("Data channel is not open. Cannot send message:", data);
      onError?.("Data channel not open. Message not sent.");
    }
  };

  return {
    startCall,
    endCall,
    addIceCandidate,
    addSessionDescription,
    sendData,
  };
}

export default RTCApi;
