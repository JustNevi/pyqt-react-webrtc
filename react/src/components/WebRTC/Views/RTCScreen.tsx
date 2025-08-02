import { useRef } from "react";

interface Props {
  localVideoStream: MediaStream | null;
  remoteVideoStream: MediaStream | null;
}

function RTCScreen({ localVideoStream, remoteVideoStream }: Props) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  if (localVideoRef.current) {
    localVideoRef.current.srcObject = localVideoStream;
  }
  if (remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteVideoStream;
  }

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div
            className="position-relative bg-dark rounded"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-100 h-100 rounded"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div
            className="position-relative bg-dark rounded"
            style={{ aspectRatio: "16/9" }}
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-100 h-100 rounded"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default RTCScreen;
