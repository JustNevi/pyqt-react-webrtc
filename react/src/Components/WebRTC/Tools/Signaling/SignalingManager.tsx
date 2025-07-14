import { useRef, useEffect } from "react";
import SignalingApi from "./SignalingApi";

import { sha256, makeid } from "../../../Units/Units";

interface Props {
  isOffering: boolean;
  pass?: string;
  onPass: (pass: string) => void;
}

function SignalingManager({ isOffering, pass, onPass }: Props) {
  const endpoint = "http://127.0.0.1:8000/api/v1/";
  const passRef = useRef("");
  const hashPassRef = useRef("");
  const clientIdRef = useRef(0);
  const iceCandidatesRef = useRef<any[]>([]);

  const signalingApi = SignalingApi({ endpoint: endpoint });

  useEffect(() => {
    const generateAndHashPassword = async () => {
      let generatedPass = "";
      if (pass) {
        generatedPass = pass;
      }
      if (isOffering) {
        generatedPass = makeid(10);
      }
      passRef.current = generatedPass;

      const hashed = await sha256(generatedPass);
      hashPassRef.current = hashed;

      console.log("Hashed Pass:", hashPassRef.current);
    };
    generateAndHashPassword();
    console.log("Generated Pass:", passRef.current);
    onPass(passRef.current);
  }, [pass]);

  const addOfferSessionDescription = (session: any) => {
    signalingApi.addOfferSessionDescription(
      hashPassRef.current,
      session,
      (response) => {
        clientIdRef.current = response.client_id;
        // Log
        console.log("addOfferSessionDescription", response);
      }
    );
  };
  const addAnswerSessionDescription = (session: any) => {
    signalingApi.addAnswerSessionDescription(
      passRef.current,
      session,
      (response) => {
        clientIdRef.current = response.client_id;
        // Log
        console.log("addAnswerSessionDescription", response);
      }
    );
  };

  const getOfferSessionDescription = (onSession: (session: any) => void) => {
    signalingApi.getOfferSessionDescription(passRef.current, (response) => {
      // Log
      console.log("getOfferSessionDescription", response);

      if (response) {
        if (response.status && response.status == "success") {
          console.log(response.offer);
          onSession(response.offer);
        }
      }
    });
  };
  const getAnswerSessionDescription = (onSession: (session: any) => void) => {
    signalingApi.getAnswerSessionDescription(passRef.current, (response) => {
      // Log
      console.log("getAnswerSessionDescription", response);

      if (response) {
        if (response.status && response.status == "success") {
          console.log(response.answer);
          onSession(response.answer);
        }
      }
    });
  };

  const addIceCandidate = (iceCandidate: any) => {
    iceCandidatesRef.current.push(iceCandidate);
    if (clientIdRef.current != 0 && iceCandidatesRef.current) {
      iceCandidatesRef.current.forEach((candidate: any) => {
        signalingApi.addIceCandidate(
          clientIdRef.current,
          passRef.current,
          candidate,
          (response) => {
            // Log
            console.log("addIceCandidate", response);
          }
        );
      });
      iceCandidatesRef.current = [];
    }
  };
  const addOfferIceCandidate = (candidate: any) => {
    addIceCandidate(candidate);
  };
  const addAnswerIceCandidate = (candidate: any) => {
    addIceCandidate(candidate);
  };

  const getOfferIceCandidates = (onCandidates: (candidates: any[]) => void) => {
    signalingApi.getOfferIceCandidates(passRef.current, (response) => {
      // Log
      console.log("getOfferIceCandidates", response);

      if (response) {
        if (response.status && response.status == "success") {
          onCandidates(response.candidates);
        }
      }
    });
  };
  const getAnswerIceCandidates = (
    onCandidates: (candidates: any[]) => void
  ) => {
    signalingApi.getAnswerIceCandidates(passRef.current, (response) => {
      // Log
      console.log("getAnswerIceCandidates", response);

      if (response) {
        if (response.status && response.status == "success") {
          onCandidates(response.candidates);
        }
      }
    });
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
