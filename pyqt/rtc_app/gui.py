import sys
import queue
from PyQt5.QtWidgets import (
    QApplication,
    QWidget,
    QListWidget,
    QPushButton,
    QLabel,
    QHBoxLayout,
    QVBoxLayout
)
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QPixmap


class MainWindow(QWidget):
    def __init__(self, frame_queue: queue.Queue):
        super().__init__()
        self.frame_queue = frame_queue
        self.setup_ui()

        # Timer updates the image_label with new frames
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)  # 30ms interval ≈ 30 FPS

    def setup_ui(self):
        self.setWindowTitle("Goyda")
        self.setGeometry(100, 100, 800, 500)

        # Layouts
        self.horizontal_layout = QHBoxLayout(self)
        self.vertical_layout = QVBoxLayout()

        # Widgets
        self.connections_list = QListWidget(self)
        self.logs_list = QListWidget(self)
        self.image_label = QLabel("Image Placeholder", self)
        self.image_label.setFixedSize(640, 480)
        self.accept_connection_button = QPushButton("Accept Connection", self)

        # Assemble vertical layout
        self.vertical_layout.addWidget(self.connections_list)
        self.vertical_layout.addWidget(self.accept_connection_button)

        # Assemble horizontal layout
        self.horizontal_layout.addLayout(self.vertical_layout)
        self.horizontal_layout.addWidget(self.image_label)
        self.horizontal_layout.addWidget(self.logs_list)
        self.horizontal_layout.setStretch(0, 2)
        self.horizontal_layout.setStretch(1, 4)
        self.horizontal_layout.setStretch(2, 2)

        # For test/demo purposes only
        self.add_test_connections()

    def add_test_connections(self):
        """
        Adds placeholder connection entries for testing UI.
        """
        self.connections_list.addItem("New Connection")
        self.connections_list.addItem("Another Connection")
        self.connections_list.addItem("Yet Another Connection")

    def update_frame(self):
        """
        Pulls the latest frame from the queue and updates the image label.
        """
        try:
            pixmap = self.frame_queue.get_nowait()
            self.image_label.setPixmap(pixmap.scaled(
                self.image_label.size(),
                aspectRatioMode=1  # Keep aspect ratio
            ))
        except queue.Empty:
            pass


if __name__ == '__main__':
    app = QApplication(sys.argv)
    frame_queue = queue.Queue()
    window = MainWindow(frame_queue)
    window.show()
    sys.exit(app.exec_())
