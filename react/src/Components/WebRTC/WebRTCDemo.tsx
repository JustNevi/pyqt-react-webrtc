import React, { useState, useRef, useEffect } from "react";

interface WebRTCProps {
  onError?: (error: string) => void;
}

const WebRTCDemo: React.FC<WebRTCProps> = ({ onError }) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [offer, setOffer] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [remoteOffer, setRemoteOffer] = useState<string>("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // WebRTC configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Initialize peer connection
  const initializePeerConnection = (): RTCPeerConnection => {
    const pc = new RTCPeerConnection(rtcConfig);

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      console.log("Connection state:", pc.connectionState);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate);
        // In a real app, send this to the remote peer via signaling server
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log("Remote track received");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Create data channel for text messages
    const dataChannel = pc.createDataChannel("messages");
    dataChannel.onopen = () => console.log("Data channel opened");
    dataChannel.onmessage = (event) => {
      console.log("Message received:", event.data);
    };
    dataChannelRef.current = dataChannel;

    return pc;
  };

  // Get user media
  const getUserMedia = async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      const errorMsg = `Error accessing media devices: ${err}`;
      onError?.(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Start call as caller
  const startCall = async () => {
    try {
      const stream = await getUserMedia();
      localStreamRef.current = stream;

      const pc = initializePeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // In a real app, send offer to remote peer via signaling server
      setOffer(JSON.stringify(offer));
      setIsCallActive(true);

      console.log("Call started, offer created");
    } catch (err) {
      onError?.(`Failed to start call: ${err}`);
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    if (!remoteOffer) {
      onError?.("No remote offer available");
      return;
    }

    try {
      const stream = await getUserMedia();
      localStreamRef.current = stream;

      const pc = initializePeerConnection();
      peerConnectionRef.current = pc;

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      const remoteDesc = JSON.parse(remoteOffer);
      await pc.setRemoteDescription(remoteDesc);

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      setAnswer(JSON.stringify(answer));
      setIsCallActive(true);

      console.log("Call answered");
    } catch (err) {
      onError?.(`Failed to answer call: ${err}`);
    }
  };

  // End call
  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setConnectionState("new");
    setOffer("");
    setAnswer("");
    setRemoteOffer("");
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Handle setting remote offer from peer
  const handleRemoteOffer = async (offerText: string) => {
    setRemoteOffer(offerText);
  };

  // Handle setting remote answer from peer
  const handleRemoteAnswer = async (answerText: string) => {
    if (peerConnectionRef.current && answerText) {
      try {
        const remoteDesc = JSON.parse(answerText);
        await peerConnectionRef.current.setRemoteDescription(remoteDesc);
        console.log("Remote answer set");
      } catch (err) {
        onError?.(`Failed to set remote answer: ${err}`);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const getConnectionBadgeClass = () => {
    switch (connectionState) {
      case "connected":
        return "badge bg-success";
      case "connecting":
        return "badge bg-warning";
      case "failed":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow">
              <div className="card-header">
                <h1 className="text-center mb-0">WebRTC Video Call</h1>
              </div>
              <div className="card-body">
                {/* Video containers */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <div
                      className="position-relative bg-dark rounded"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-100 h-100 rounded"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-dark bg-opacity-75 text-white">
                          Local Video
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div
                      className="position-relative bg-dark rounded"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-100 h-100 rounded"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-dark bg-opacity-75 text-white">
                          Remote Video
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connection status */}
                <div className="text-center mb-4">
                  <span className={getConnectionBadgeClass()}>
                    Connection: {connectionState}
                  </span>
                </div>

                {/* Call controls */}
                <div className="d-flex justify-content-center gap-3 mb-4">
                  {!isCallActive ? (
                    <>
                      <button
                        onClick={startCall}
                        className="btn btn-success d-flex align-items-center gap-2"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                        Start Call
                      </button>
                      <button
                        onClick={answerCall}
                        disabled={!remoteOffer}
                        className="btn btn-primary d-flex align-items-center gap-2"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                        Answer Call
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={toggleVideo}
                        className={`btn d-flex align-items-center gap-2 ${
                          isVideoEnabled ? "btn-secondary" : "btn-danger"
                        }`}
                      >
                        {isVideoEnabled ? (
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={toggleAudio}
                        className={`btn d-flex align-items-center gap-2 ${
                          isAudioEnabled ? "btn-secondary" : "btn-danger"
                        }`}
                      >
                        {isAudioEnabled ? (
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={endCall}
                        className="btn btn-danger d-flex align-items-center gap-2"
                      >
                        <svg
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.96-.43-.96-.96V9.72C2.21 10.4 2 11.18 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-.82-.21-1.6-.54-2.28v5.17c0 .53-.43.96-.96.96-.25 0-.5-.1-.68-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                        </svg>
                        End Call
                      </button>
                    </>
                  )}
                </div>

                {/* Signaling section */}
                <div className="border-top pt-4">
                  <h4 className="mb-3">Signaling (Demo)</h4>
                  <div className="alert alert-info" role="alert">
                    <small>
                      In a real application, you would use a signaling server
                      (WebSocket, Socket.IO, etc.) to exchange offers and
                      answers between peers.
                    </small>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <strong>Your Offer/Answer:</strong>
                      </label>
                      <textarea
                        value={offer || answer}
                        readOnly
                        className="form-control"
                        rows={8}
                        style={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                        placeholder="Offer or answer will appear here..."
                      />
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Remote Offer:</strong>
                        </label>
                        <textarea
                          value={remoteOffer}
                          onChange={(e) => handleRemoteOffer(e.target.value)}
                          className="form-control"
                          rows={4}
                          style={{
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                          }}
                          placeholder="Paste remote offer here..."
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          <strong>Remote Answer:</strong>
                        </label>
                        <textarea
                          onChange={(e) => handleRemoteAnswer(e.target.value)}
                          className="form-control"
                          rows={4}
                          style={{
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                          }}
                          placeholder="Paste remote answer here..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebRTCDemo;
