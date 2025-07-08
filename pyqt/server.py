import os
from aiohttp import web
from aiortc import RTCPeerConnection, MediaStreamTrack, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole
from PyQt5.QtGui import QImage, QPixmap
import queue


pcs = set()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(BASE_DIR, 'client.html')

frame_queue = None
pcs = set()

class VideoReceiver(MediaStreamTrack):
    kind = "video"

    def __init__(self, track, frame_queue):
        super().__init__()
        self.track = track
        self.frame_queue = frame_queue
        print(self.frame_queue)

    async def recv(self):
        frame = await self.track.recv()
        print("🎥 Отримано кадр")
        img = frame.to_ndarray(format="bgr24")

        h, w, ch = img.shape
        bytes_per_line = ch * w
        qimg = QImage(img.data, w, h, bytes_per_line, QImage.Format_RGB888).rgbSwapped()
        pixmap = QPixmap.fromImage(qimg)

        try:
            self.frame_queue.put_nowait(pixmap)
        except queue.Full:
            pass
        return frame

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
            receiver = VideoReceiver(track, frame_queue)
            pc.addTrack(receiver)

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
