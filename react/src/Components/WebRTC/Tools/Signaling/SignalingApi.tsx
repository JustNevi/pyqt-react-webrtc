import { useState, useEffect, useCallback } from "react";

export type RTCIceCandidateJSON = {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment: string;
};

export type RTCSessionDescriptionJSON = {
  type: RTCSessionDescriptionInit["type"];
  sdp: string;
};

const LS_OFFER_SDP_KEY = "webRtcOfferSdp";
const LS_OFFER_ICE_KEY = "webRtcOfferIceCandidates";
const LS_ANSWER_SDP_KEY = "webRtcAnswerSdp";
const LS_ANSWER_ICE_KEY = "webRtcAnswerIceCandidates";

function useSignalingApi() {
  const [offerSdp, setOfferSdp] = useState<RTCSessionDescriptionJSON | null>(
    null
  );
  const [offerIceCandidates, setOfferIceCandidates] = useState<
    RTCIceCandidateJSON[]
  >([]);
  const [answerSdp, setAnswerSdp] = useState<RTCSessionDescriptionJSON | null>(
    null
  );
  const [answerIceCandidates, setAnswerIceCandidates] = useState<
    RTCIceCandidateJSON[]
  >([]);

  // Load from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const offerSdp = localStorage.getItem(LS_OFFER_SDP_KEY);
      const offerIce = localStorage.getItem(LS_OFFER_ICE_KEY);
      const answerSdp = localStorage.getItem(LS_ANSWER_SDP_KEY);
      const answerIce = localStorage.getItem(LS_ANSWER_ICE_KEY);

      if (offerSdp) setOfferSdp(JSON.parse(offerSdp));
      if (offerIce) setOfferIceCandidates(JSON.parse(offerIce));
      if (answerSdp) setAnswerSdp(JSON.parse(answerSdp));
      if (answerIce) setAnswerIceCandidates(JSON.parse(answerIce));
    };

    loadData();

    // Listen to changes from other tabs
    const onStorage = (event: StorageEvent) => {
      if (event.key === LS_OFFER_SDP_KEY && event.newValue)
        setOfferSdp(JSON.parse(event.newValue));
      if (event.key === LS_OFFER_ICE_KEY && event.newValue)
        setOfferIceCandidates(JSON.parse(event.newValue));
      if (event.key === LS_ANSWER_SDP_KEY && event.newValue)
        setAnswerSdp(JSON.parse(event.newValue));
      if (event.key === LS_ANSWER_ICE_KEY && event.newValue)
        setAnswerIceCandidates(JSON.parse(event.newValue));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addOfferSessionDescription = useCallback(
    (session: RTCSessionDescriptionInit) => {
      const json = { type: session.type, sdp: session.sdp || "" };
      localStorage.setItem(LS_OFFER_SDP_KEY, JSON.stringify(json));
      setOfferSdp(json);
    },
    []
  );

  const addOfferIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    const jsonCandidate = candidate.toJSON();
    const current = JSON.parse(localStorage.getItem(LS_OFFER_ICE_KEY) || "[]");
    const updated = [...current, jsonCandidate];
    localStorage.setItem(LS_OFFER_ICE_KEY, JSON.stringify(updated));
    setOfferIceCandidates(updated);
  }, []);

  const addAnswerSessionDescription = useCallback(
    (session: RTCSessionDescriptionInit) => {
      const json = { type: session.type, sdp: session.sdp || "" };
      localStorage.setItem(LS_ANSWER_SDP_KEY, JSON.stringify(json));
      setAnswerSdp(json);
    },
    []
  );

  const addAnswerIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    const jsonCandidate = candidate.toJSON();
    const current = JSON.parse(localStorage.getItem(LS_ANSWER_ICE_KEY) || "[]");
    const updated = [...current, jsonCandidate];
    localStorage.setItem(LS_ANSWER_ICE_KEY, JSON.stringify(updated));
    setAnswerIceCandidates(updated);
  }, []);

  const clearSignalingData = useCallback(() => {
    localStorage.removeItem(LS_OFFER_SDP_KEY);
    localStorage.removeItem(LS_OFFER_ICE_KEY);
    localStorage.removeItem(LS_ANSWER_SDP_KEY);
    localStorage.removeItem(LS_ANSWER_ICE_KEY);
    setOfferSdp(null);
    setOfferIceCandidates([]);
    setAnswerSdp(null);
    setAnswerIceCandidates([]);
  }, []);

  const logAllSignalingData = useCallback(() => {
    console.log("=== Signaling Data ===");

    console.log("Offer SDP:", offerSdp);
    console.log("Offer ICE Candidates:", offerIceCandidates);

    console.log("Answer SDP:", answerSdp);
    console.log("Answer ICE Candidates:", answerIceCandidates);

    console.log("=== LocalStorage Raw ===");
    console.log(LS_OFFER_SDP_KEY, localStorage.getItem(LS_OFFER_SDP_KEY));
    console.log(LS_OFFER_ICE_KEY, localStorage.getItem(LS_OFFER_ICE_KEY));
    console.log(LS_ANSWER_SDP_KEY, localStorage.getItem(LS_ANSWER_SDP_KEY));
    console.log(LS_ANSWER_ICE_KEY, localStorage.getItem(LS_ANSWER_ICE_KEY));
  }, [offerSdp, offerIceCandidates, answerSdp, answerIceCandidates]);

  return {
    addOfferSessionDescription,
    addOfferIceCandidate,
    addAnswerSessionDescription,
    addAnswerIceCandidate,
    getOfferSessionDescription: () => offerSdp,
    getOfferIceCandidates: () => offerIceCandidates,
    getAnswerSessionDescription: () => answerSdp,
    getAnswerIceCandidates: () => answerIceCandidates,
    clearSignalingData,
    logAllSignalingData,
  };
}

export default useSignalingApi;
