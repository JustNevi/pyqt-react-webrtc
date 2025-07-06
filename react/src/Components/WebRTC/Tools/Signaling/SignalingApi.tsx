// src/hooks/useSignalingApi.ts
import { useState, useCallback } from "react";

// Define clear types for your signaling data
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

// Keys for Local Storage
const LS_OFFER_SDP_KEY = "webRtcOfferSdp";
const LS_OFFER_ICE_KEY = "webRtcOfferIceCandidates";
const LS_ANSWER_SDP_KEY = "webRtcAnswerSdp";
const LS_ANSWER_ICE_KEY = "webRtcAnswerIceCandidates";

function SignalingApi() {
  // State to hold and manage signaling data in memory
  const [offerSdp, setOfferSdp] = useState<RTCSessionDescriptionJSON | null>(
    () => {
      const stored = localStorage.getItem(LS_OFFER_SDP_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  );
  const [offerIceCandidates, setOfferIceCandidates] = useState<
    RTCIceCandidateJSON[]
  >(() => {
    const stored = localStorage.getItem(LS_OFFER_ICE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [answerSdp, setAnswerSdp] = useState<RTCSessionDescriptionJSON | null>(
    () => {
      const stored = localStorage.getItem(LS_ANSWER_SDP_KEY);
      return stored ? JSON.parse(stored) : null;
    }
  );
  const [answerIceCandidates, setAnswerIceCandidates] = useState<
    RTCIceCandidateJSON[]
  >(() => {
    const stored = localStorage.getItem(LS_ANSWER_ICE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const addOfferIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    // @ts-ignore
    const jsonCandidate: RTCIceCandidateJSON = candidate.toJSON();
    setOfferIceCandidates((prev) => {
      const newCandidates = [...prev, jsonCandidate];
      localStorage.setItem(LS_OFFER_ICE_KEY, JSON.stringify(newCandidates));
      return newCandidates;
    });
  }, []);

  const addOfferSessionDescription = useCallback(
    (session: RTCSessionDescriptionInit) => {
      const jsonSession: RTCSessionDescriptionJSON = {
        type: session.type,
        sdp: session.sdp || "",
      };
      setOfferSdp(jsonSession);
      localStorage.setItem(LS_OFFER_SDP_KEY, JSON.stringify(jsonSession));
    },
    []
  );

  const addAnswerIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    // @ts-ignore
    const jsonCandidate: RTCIceCandidateJSON = candidate.toJSON();
    setAnswerIceCandidates((prev) => {
      const newCandidates = [...prev, jsonCandidate];
      localStorage.setItem(LS_ANSWER_ICE_KEY, JSON.stringify(newCandidates));
      return newCandidates;
    });
  }, []);

  const addAnswerSessionDescription = useCallback(
    (session: RTCSessionDescriptionInit) => {
      const jsonSession: RTCSessionDescriptionJSON = {
        type: session.type,
        sdp: session.sdp || "",
      };
      setAnswerSdp(jsonSession);
      localStorage.setItem(LS_ANSWER_SDP_KEY, JSON.stringify(jsonSession));
    },
    []
  );

  const getOfferIceCandidates = useCallback(() => {
    return offerIceCandidates; // Returns the current state
  }, [offerIceCandidates]);

  const getOfferSessionDescription = useCallback(() => {
    return offerSdp; // Returns the current state
  }, [offerSdp]);

  const getAnswerIceCandidates = useCallback(() => {
    return answerIceCandidates; // Returns the current state
  }, [answerIceCandidates]);

  const getAnswerSessionDescription = useCallback(() => {
    return answerSdp; // Returns the current state
  }, [answerSdp]);

  // Optional: Function to clear all stored signaling data
  const clearSignalingData = useCallback(() => {
    localStorage.removeItem(LS_OFFER_SDP_KEY);
    localStorage.removeItem(LS_OFFER_ICE_KEY);
    localStorage.removeItem(LS_ANSWER_SDP_KEY);
    localStorage.removeItem(LS_ANSWER_ICE_KEY);
    setOfferSdp(null);
    setOfferIceCandidates([]);
    setAnswerSdp(null);
    setAnswerIceCandidates([]);
    console.log("Cleared all signaling data from Local Storage.");
  }, []);

  return {
    addOfferIceCandidate,
    addOfferSessionDescription,
    addAnswerIceCandidate,
    addAnswerSessionDescription,
    getOfferIceCandidates,
    getOfferSessionDescription,
    getAnswerIceCandidates,
    getAnswerSessionDescription,
    clearSignalingData, // Expose the clear function
  };
}

export default SignalingApi;
