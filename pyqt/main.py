import sys
import asyncio
from PyQt5.QtWidgets import QApplication
import qasync
from gui import MainWindow
from server import app
from aiohttp import web
import queue
import server


async def start_server():
    print('STARTED')
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host="127.0.0.1", port=8080)
    await site.start()
    print("🌐 Aiohttp server started at http://127.0.0.1:8080")


if __name__ == "__main__":
    app_qt = QApplication(sys.argv)
    loop = qasync.QEventLoop(app_qt)
    asyncio.set_event_loop(loop)
    frame_queue = queue.Queue()
    server.frame_queue = frame_queue
    window = MainWindow(frame_queue)
    print("GUI started")
    window.show()

    with loop:
        loop.run_until_complete(start_server())
        loop.run_forever()