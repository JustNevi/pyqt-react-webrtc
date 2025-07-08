import sys
import queue
from PyQt5.QtWidgets import QApplication, QWidget, QListWidget, QPushButton, QLabel, QHBoxLayout, QVBoxLayout
from PyQt5.QtCore import QTimer
from PyQt5.QtGui import QPixmap


class MainWindow(QWidget):
    def __init__(self, frame_queue):
        super().__init__()
        self.frame_queue = frame_queue
        self.setupUi()

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)  # 30 FPS

    def setupUi(self):
        self.setWindowTitle("Goyda")
        self.setGeometry(100, 100, 800, 500)

        self.horizontalLayout = QHBoxLayout(self)
        self.verticalLayout = QVBoxLayout()

        self.connections_list = QListWidget(self)
        self.logs_list = QListWidget(self)
        self.image_label = QLabel("Image Placeholder", self)
        self.image_label.setFixedSize(640, 480)
        self.accept_connection_button = QPushButton("Accept Connection", self)

        self.verticalLayout.addWidget(self.connections_list)
        self.verticalLayout.addWidget(self.accept_connection_button)

        self.horizontalLayout.addLayout(self.verticalLayout)
        self.horizontalLayout.addWidget(self.image_label)
        self.horizontalLayout.addWidget(self.logs_list)
        self.horizontalLayout.setStretch(0, 2)
        self.horizontalLayout.setStretch(1, 4)
        self.horizontalLayout.setStretch(2, 2)

        self.add_test_connections()

    def add_test_connections(self):
        self.connections_list.addItem("New Connection")
        self.connections_list.addItem("Another Connection")
        self.connections_list.addItem("Yet Another Connection")

    def update_frame(self):
        try:
            pixmap = self.frame_queue.get_nowait()
            print("✅ Pixmap received in GUI")
            self.image_label.setPixmap(pixmap.scaled(
                self.image_label.size(),
                aspectRatioMode=1
            ))
        except queue.Empty:
            pass


if __name__ == '__main__':
    app = QApplication(sys.argv)
    frame_queue = queue.Queue()
    window = MainWindow(frame_queue)
    window.show()
    sys.exit(app.exec_())
