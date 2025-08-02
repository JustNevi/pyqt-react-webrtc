import { useState } from "react";
import RTCScreen from "./RTCScreen";
//import RTCDemo from "./RTCDemo";
import RTCManager from "../Tools/RTCManager";

function RTCView() {
  const [isOffering, setIsOffering] = useState(true);
  const [password, setPassword] = useState("");
  const [offerPassword, setOfferPassword] = useState("");
  const [message, setMessage] = useState("");

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const {
    startCall,
    endCall,
    getIceCadidates,
    getSessionDescription,
    sendData,
  } = RTCManager({
    isOffering: isOffering,
    pass: offerPassword,
    onPass: (pass) => {
      setPassword(pass);
    },
    onLocalStream: (stream) => {
      setLocalStream(stream);
    },
    onRemoteStream: (stream) => {
      setRemoteStream(stream);
    },
  });

  return (
    <>
      <div className="form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="checkNativeSwitch"
          checked={isOffering}
          onChange={(event) => setIsOffering(event.target.checked)}
        />
        <label className="form-check-label" htmlFor="checkNativeSwitch">
          Offering
        </label>
      </div>

      <RTCScreen
        localVideoStream={localStream}
        remoteVideoStream={remoteStream}
      ></RTCScreen>
      <button type="button" className="btn btn-success" onClick={startCall}>
        Start Call
      </button>
      <button type="button" className="btn btn-danger" onClick={endCall}>
        End Call
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={getSessionDescription}
      >
        Get SessionDescription
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={getIceCadidates}
      >
        Get IceCadidates
      </button>
      <div>Pass: {password}</div>
      <div className="input-group mb-3">
        <span className="input-group-text" id="basic-addon1">
          Offer pass:
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Password"
          aria-label="Password"
          aria-describedby="basic-addon1"
          value={offerPassword}
          onChange={(event) => {
            setOfferPassword(event.target.value);
          }}
        />
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Message"
          aria-label="Message"
          aria-describedby="button-addon2"
          onChange={(event) => {
            setMessage(event.target.value);
          }}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          id="button-addon2"
          onClick={() => {
            sendData(message);
          }}
        >
          Send
        </button>
      </div>
    </>
  );
}

export default RTCView;
