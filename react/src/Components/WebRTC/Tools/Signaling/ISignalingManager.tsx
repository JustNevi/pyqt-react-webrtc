export interface ISignalingManager {
  addOfferIceCandidate: (candidate: any) => void;
  addOfferSessionDescription: (session: any) => void;
  addAnswerIceCandidate: (candidate: any) => void;
  addAnswerSessionDescription: (session: any) => void;
  getOfferIceCandidates: () => any[];
  getOfferSessionDescription: () => any;
  getAnswerIceCandidates: () => any[];
  getAnswerSessionDescription: () => any;
}
