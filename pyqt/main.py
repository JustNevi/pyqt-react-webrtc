import sys
from PyQt5.QtWidgets import QApplication, QWidget

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle("My Simple PyQt5 Window")
    window.setGeometry(100, 100, 400, 300)
    window.show()
    sys.exit(app.exec_())