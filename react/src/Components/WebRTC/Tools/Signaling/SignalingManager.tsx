import type { ISignalingManager } from "./ISignalingManager";
import SignalingApi from "./SignalingApi";

function SignalingManager(): ISignalingManager {
  const signalingApi = SignalingApi();

  const addOfferIceCandidate = (candidate: any) => {
    signalingApi.addOfferIceCandidate(candidate);
  };
  const addOfferSessionDescription = (session: any) => {
    signalingApi.addOfferSessionDescription(session);
  };
  const addAnswerIceCandidate = (candidate: any) => {
    signalingApi.addAnswerIceCandidate(candidate);
  };
  const addAnswerSessionDescription = (session: any) => {
    signalingApi.addAnswerSessionDescription(session);
  };
  const getOfferIceCandidates = () => {
    return signalingApi.getOfferIceCandidates();
  };
  const getOfferSessionDescription = () => {
    return signalingApi.getOfferSessionDescription();
  };
  const getAnswerIceCandidates = () => {
    return signalingApi.getAnswerIceCandidates();
  };
  const getAnswerSessionDescription = () => {
    return signalingApi.getAnswerSessionDescription();
  };
  return {
    addOfferIceCandidate,
    addOfferSessionDescription,
    addAnswerIceCandidate,
    addAnswerSessionDescription,
    getOfferIceCandidates,
    getOfferSessionDescription,
    getAnswerIceCandidates,
    getAnswerSessionDescription,
  };
}

export default SignalingManager;
