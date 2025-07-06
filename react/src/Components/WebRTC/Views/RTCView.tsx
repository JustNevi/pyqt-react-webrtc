import { useState } from "react";
import RTCScreen from "./RTCScreen";
//import RTCDemo from "./RTCDemo";
import RTCManager from "../Tools/RTCManager";

function RTCView() {
  const [isOffering, setIsOffering] = useState(true);

  const { startCall, endCall, getIceCadidates, getSessionDescription } =
    RTCManager({ isOffering: isOffering });

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

      <RTCScreen></RTCScreen>
      <button type="button" className="btn btn-success" onClick={startCall}>
        Start Call
      </button>
      <button type="button" className="btn btn-danger" onClick={endCall}>
        End Call
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={getIceCadidates}
      >
        Get IceCadidates
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={getSessionDescription}
      >
        Get SessionDescription
      </button>
    </>
  );
}

export default RTCView;
