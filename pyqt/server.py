import os
from aiohttp import web
from aiortc import RTCPeerConnection, MediaStreamTrack, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole
from PyQt5.QtGui import QImage, QPixmap
from av import VideoFrame
import cv2
import queue
import asyncio


pcs = set()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(BASE_DIR, 'client.html')

frame_queue = None
pcs = set()

class VideoReceiver:
    def __init__(self, track: MediaStreamTrack, frame_queue):
        self.track = track
        self.frame_queue = frame_queue
        self.running = True

    async def run(self):
        while self.running:
            try:
                frame: VideoFrame = await self.track.recv()
                img = frame.to_ndarray(format="bgr24")
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                h, w, ch = img.shape
                bytes_per_line = ch * w
                qt_image = QImage(img.data, w, h, bytes_per_line, QImage.Format_RGB888)
                pixmap = QPixmap.fromImage(qt_image)

                # Тільки останній кадр лишаємо
                while not self.frame_queue.empty():
                    self.frame_queue.get_nowait()
                self.frame_queue.put_nowait(pixmap)

            except Exception as e:
                print(f"[❌] VideoReceiver error: {e}")
                self.running = False

async def offer(request):
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
            print("🎥 Вхідний відеотрек отримано")
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
    if os.path.exists(HTML_PATH):
        return web.FileResponse(HTML_PATH)
    else:
        return web.Response(status=404, text="client.html not found")
    
app = web.Application()
app.router.add_get('/', index)
app.router.add_post('/offer', offer)

if __name__ == "__main__":
    web.run_app(app, host="127.0.0.1", port=8080)
