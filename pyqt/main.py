import sys
from PyQt5.QtWidgets import QApplication, QWidget
from PyQt5 import QtWidgets

class MyWindow(QWidget):
    def setupUi(self):
        self.setWindowTitle("Goyda")
        self.setGeometry(100, 100, 400, 300)
        self.horizontalLayout = QtWidgets.QHBoxLayout(self)
        self.verticalLayout = QtWidgets.QVBoxLayout(self)

        self.logs_list = QtWidgets.QListWidget(self)
        self.connections_list = QtWidgets.QListWidget(self)
        self.accept_connection_button = QtWidgets.QPushButton("Accept Connection", self)

        self.horizontalLayout.addLayout(self.verticalLayout)
        self.horizontalLayout.addWidget(self.logs_list)
        self.verticalLayout.addWidget(self.connections_list)
        self.verticalLayout.addWidget(self.accept_connection_button)

        self.add_new_connection()

    def add_new_connection(self):
        self.connections_list.addItem("New Connection")
        self.connections_list.addItem("Another Connection")
        self.connections_list.addItem("Yet Another Connection")

    def __init__(self):
        super().__init__()
        self.setupUi()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MyWindow()
    window.show()
    sys.exit(app.exec_())