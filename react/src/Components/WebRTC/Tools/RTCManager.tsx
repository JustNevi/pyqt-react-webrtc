import RTCApi from "./Api/RTCApi";
//import type { ISignalingManager } from "./Signaling/ISignalingManager";
import SignalingManager from "./Signaling/SignalingManager";

export interface RTCManager {
  startCall: () => void;
  endCall: () => void;
}

interface Props {
  isOffering: boolean;
  pass?: string;
  onPass: (pass: string) => void;
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
}

function RTCManager({
  isOffering,
  pass,
  onPass,
  onLocalStream,
  onRemoteStream,
}: Props) {
  const signalingManager = SignalingManager({
    isOffering: isOffering,
    pass: pass,
    onPass: onPass,
  });

  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  let signalIceCadidate = (candidate: RTCIceCandidate) => {
    console.log(candidate);
  };
  let signalSessionDescription = (session: RTCSessionDescriptionInit) => {
    console.log(session);
  };

  if (signalingManager != null) {
    if (isOffering) {
      signalIceCadidate = (candidate: RTCIceCandidate) => {
        signalingManager.addOfferIceCandidate(candidate);
      };
      signalSessionDescription = (session: RTCSessionDescriptionInit) => {
        signalingManager.addOfferSessionDescription(session);
      };
    } else {
      signalIceCadidate = (candidate: RTCIceCandidate) => {
        signalingManager.addAnswerIceCandidate(candidate);
      };
      signalSessionDescription = (session: RTCSessionDescriptionInit) => {
        signalingManager.addAnswerSessionDescription(session);
      };
    }
  }

  const { addIceCandidate, addSessionDescription, startCall, endCall } = RTCApi(
    {
      isOffering: isOffering,
      useVideo: true,
      useAudio: true,
      useData: true,
      config: rtcConfig,
      onLocalStream: (stream) => {
        console.log("===Local stream available===", stream);
        onLocalStream(stream);
      },
      onRemoteStream: (stream) => {
        console.log("===Remote stream available===", stream);
        onRemoteStream(stream);
      },
      onIceCandidate: (candidate) => {
        //console.log("===Need to send local ICE candidate===", candidate);
        signalIceCadidate(candidate);
      },
      onSessionDescription: (session) => {
        //console.log("===Need to send local SDP===", session);
        signalSessionDescription(session);
      },
    }
  );

  let getIceCadidates = () => {};
  let getSessionDescription = () => {};

  if (signalingManager != null) {
    if (isOffering) {
      getIceCadidates = () => {
        signalingManager.getAnswerIceCandidates((candidates: any[]) => {
          candidates.forEach((candidate) => {
            addIceCandidate(candidate);
          });
        });
      };
      getSessionDescription = () => {
        signalingManager.getAnswerSessionDescription((session: any) => {
          addSessionDescription(session);
        });
      };
    } else {
      getIceCadidates = () => {
        signalingManager.getOfferIceCandidates((candidates: any[]) => {
          candidates.forEach((candidate) => {
            addIceCandidate(candidate);
          });
        });
      };
      getSessionDescription = () => {
        signalingManager.getOfferSessionDescription((session: any) => {
          addSessionDescription(session);
        });
      };
    }
  }

  return {
    startCall,
    endCall,
    getIceCadidates,
    getSessionDescription,
  };
}

export default RTCManager;
