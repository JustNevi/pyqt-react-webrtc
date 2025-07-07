import { useCallback } from "react";

interface Props {
  endpoint: string;
}

function SignalingApi({ endpoint }: Props) {
  const getRequestOptions = useCallback((method: string, body: {}) => {
    return {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  }, []);

  const fetcher = useCallback(
    (url: string, options: {}, onResponse: (data: any) => void) => {
      fetch(url, options)
        .then((res) => res.json())
        .then((data) => {
          onResponse(data);
        });
    },
    []
  );

  // @ts-ignore
  const addOfferSessionDescription = (
    hash_pass: string,
    session: any,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      offer: session,
      hash_pass: hash_pass,
    });

    fetcher(endpoint + "add-offer-sd/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const addAnswerSessionDescription = (
    pass: string,
    session: any,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      answer: session,
      pass: pass,
    });

    fetcher(endpoint + "add-answer-sd/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const getOfferSessionDescription = (
    pass: string,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      pass: pass,
    });

    fetcher(endpoint + "get-offer-sd/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const getAnswerSessionDescription = (
    pass: string,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      pass: pass,
    });

    fetcher(endpoint + "get-answer-sd/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const addIceCandidate = (
    clientId: number,
    pass: string,
    candidate: any,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      client_id: clientId,
      pass: pass,
      candidate: candidate,
    });

    fetcher(endpoint + "add-ice-candidate/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const getOfferIceCandidates = (
    pass: string,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      pass: pass,
    });

    fetcher(endpoint + "get-offer-ice-candidates/", options, (data) => {
      callback(data);
    });
  };

  // @ts-ignore
  const getAnswerIceCandidates = (
    pass: string,
    callback: (resonse: any) => void
  ) => {
    const options = getRequestOptions("POST", {
      pass: pass,
    });

    fetcher(endpoint + "get-answer-ice-candidates/", options, (data) => {
      callback(data);
    });
  };

  return {
    addOfferSessionDescription,
    addAnswerSessionDescription,
    getOfferSessionDescription,
    getAnswerSessionDescription,
    addIceCandidate,
    getOfferIceCandidates,
    getAnswerIceCandidates,
  };
}

export default SignalingApi;
