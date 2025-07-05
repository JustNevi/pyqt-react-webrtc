import RTCApi from "./RTCApi";

export interface RTCManager {
  startCall: () => void;
  endCall: () => void;
}

interface Props {
  isOffering: boolean;
}

function RTCManager({ isOffering }: Props): RTCManager {
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };
  const { addIceCandidates, addSessionDescription, startCall, endCall } =
    RTCApi({
      isOffering: isOffering,
      useVideo: true,
      useAudio: true,
      useData: true,
      config: rtcConfig,
      onLocalStream: (stream) => {
        console.log("===Local stream available===", stream);
      },
      onRemoteStream: (stream) => {
        console.log("===Remote stream available===", stream);
      },
      onIceCandidates: (candidate) => {
        console.log("===Need to send local ICE candidate===", candidate);
      },
      onSessionDescription: (session) => {
        console.log("===Need to send local SDP===", session);
      },
    });

  return { startCall, endCall };
}

export default RTCManager;
