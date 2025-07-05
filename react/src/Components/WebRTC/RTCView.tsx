import RTCScreen from "./RTCScreen";
//import RTCDemo from "./RTCDemo";
import RTCManager from "./RTCManager";

function RTCView() {
  const { startCall, endCall } = RTCManager({ isOffering: true });

  return (
    <>
      <RTCScreen></RTCScreen>
      <button type="button" className="btn btn-success" onClick={startCall}>
        Start Call
      </button>
      <button type="button" className="btn btn-danger" onClick={endCall}>
        End Call
      </button>
    </>
  );
}

export default RTCView;
