import sys
import asyncio
import queue
from PyQt5.QtWidgets import QApplication
from qasync import QEventLoop
from aiohttp import web

from gui import MainWindow
from server import app
import server  # Needed to assign shared frame_queue

async def start_server():
    """
    Start the aiohttp WebRTC signaling server.
    """
    print("🔧 Starting aiohttp server...")
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host="127.0.0.1", port=8080)
    await site.start()
    print("🌐 Aiohttp server started at http://127.0.0.1:8080")

if __name__ == "__main__":
    # Initialize Qt application and asyncio event loop
    app_qt = QApplication(sys.argv)
    loop = QEventLoop(app_qt)
    asyncio.set_event_loop(loop)

    # Shared queue between WebRTC receiver and GUI
    frame_queue = queue.Queue()
    server.frame_queue = frame_queue  # Pass frame_queue to server module

    # Initialize and show main application window
    window = MainWindow(frame_queue)
    print("🖼️ GUI started")
    window.show()

    # Start aiohttp server and Qt event loop
    with loop:
        loop.run_until_complete(start_server())
        loop.run_forever()
