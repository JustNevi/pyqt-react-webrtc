import os
import cv2
import asyncio
import queue
from aiohttp import web
from aiortc import RTCPeerConnection, MediaStreamTrack, RTCSessionDescription
from av import VideoFrame
from PyQt5.QtGui import QImage, QPixmap

# Set of all active peer connections
pcs = set()

# Path to static HTML file (optional frontend)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(BASE_DIR, 'client.html')

# Global queue passed from main.py
frame_queue = None


class VideoReceiver:
    """
    Custom video receiver that reads frames from WebRTC track
    and pushes them into a GUI-compatible queue as QPixmap.
    """
    def __init__(self, track: MediaStreamTrack, frame_queue: queue.Queue):
        self.track = track
        self.frame_queue = frame_queue
        self.running = True

    async def run(self):
        while self.running:
            try:
                frame: VideoFrame = await self.track.recv()
                img = frame.to_ndarray(format="bgr24")
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                # Convert frame to Qt format
                h, w, ch = img.shape
                bytes_per_line = ch * w
                qt_image = QImage(img.data, w, h, bytes_per_line, QImage.Format_RGB888)
                pixmap = QPixmap.fromImage(qt_image)

                # Replace the latest frame
                while not self.frame_queue.empty():
                    self.frame_queue.get_nowait()
                self.frame_queue.put_nowait(pixmap)

            except Exception as e:
                print(f"[❌] VideoReceiver error: {e}")
                self.running = False


async def offer(request):
    """
    Handle incoming SDP offer and return SDP answer.
    Also attaches a video track handler.
    """
    params = await request.json()
    pc = RTCPeerConnection()
    pcs.add(pc)

    offer = RTCSessionDescription(
        sdp=params["sdp"]["sdp"],
        type=params["sdp"]["type"]
    )

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            print("🎥 Incoming video track received")
            receiver = VideoReceiver(track, frame_queue)
            asyncio.create_task(receiver.run())

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": {
            "type": pc.localDescription.type,
            "sdp": pc.localDescription.sdp
        }
    })


async def index(request):
    """
    Serve a static test HTML file if it exists.
    """
    if os.path.exists(HTML_PATH):
        return web.FileResponse(HTML_PATH)
    else:
        return web.Response(status=404, text="client.html not found")


# Web server configuration
app = web.Application()
app.router.add_get('/', index)
app.router.add_post('/offer', offer)

# For standalone testing (not used in production)
if __name__ == "__main__":
    web.run_app(app, host="127.0.0.1", port=8080)
