# client.py

import asyncio
import aiohttp
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

async def run_webrtc_client():
    pc = RTCPeerConnection()
    print("WEBRtc client initialized...")

    player = MediaPlayer("/dev/video0")
    video_track = player.video
    pc.addTrack(video_track)

    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    async with aiohttp.ClientSession() as session:
        async with session.post("http://127.0.0.1:8080/offer", json={
            "sdp": {
                "type": pc.localDescription.type,
                "sdp": pc.localDescription.sdp
            }
        }) as resp:
            answer = await resp.json()

    remote_desc = RTCSessionDescription(
        sdp=answer["sdp"]["sdp"],
        type=answer["sdp"]["type"]
    )
    await pc.setRemoteDescription(remote_desc)

    print("✅ Client connected. Video streaming...")

    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        await pc.close()

if __name__ == "__main__":
    asyncio.run(run_webrtc_client())
