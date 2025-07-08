import asyncio
import aiohttp
import cv2
from aiortc import RTCPeerConnection, RTCSessionDescription

async def display_video(track):
    while True:
        frame = await track.recv()
        img = frame.to_ndarray(format="bgr24")
        cv2.imshow("Екран з сервера", img)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            cv2.destroyAllWindows()
            break

async def run():
    pc = RTCPeerConnection()

    @pc.on("track")
    def on_track(track):
        print("Отримано відеотрек 🎥")
        asyncio.create_task(display_video(track))

    async with aiohttp.ClientSession() as session:
        offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        async with session.post("http://localhost:8080/offer", json={
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
        }) as resp:
            answer = await resp.json()

        await pc.setRemoteDescription(RTCSessionDescription(
            sdp=answer["sdp"], type=answer["type"]
        ))

    await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        print("Клієнт зупинено.")
