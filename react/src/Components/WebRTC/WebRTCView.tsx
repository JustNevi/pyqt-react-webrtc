import WebRTCScreen from "./WebRTCScreen";
import WebRTCDemo from "./WebRTCDemo";

function WebRTCView() {
  return <WebRTCDemo></WebRTCDemo>;
  return (
    <>
      <WebRTCScreen></WebRTCScreen>
      <div className="input-group mb-3">
        <button
          className="btn btn-outline-secondary"
          type="button"
          id="button-addon1"
        >
          Create offer
        </button>
        <textarea
          className="form-control"
          aria-label="With textarea"
        ></textarea>
      </div>
      <div className="input-group mb-3">
        <button
          className="btn btn-outline-secondary"
          type="button"
          id="button-addon1"
        >
          Create answer
        </button>
        <textarea
          className="form-control"
          aria-label="With textarea"
        ></textarea>
      </div>
    </>
  );
}

export default WebRTCView;
