import sys
import requests
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QLineEdit, QTableWidget, QTableWidgetItem, QFileDialog
)
from PyQt5.QtCore import QTimer

BACKEND_URL = "http://127.0.0.1:8000"

class VotingDashboard(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("E-Voting Dashboard")
        self.resize(600, 400)

        # Layouts
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)

        # Candidate Table
        self.table = QTableWidget()
        self.table.setColumnCount(2)
        self.table.setHorizontalHeaderLabels(["Candidate", "Votes"])
        self.layout.addWidget(self.table)

        # Add Participant Section
        self.part_layout = QHBoxLayout()
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("Participant Username")
        self.part_layout.addWidget(self.username_input)
        self.file_btn = QPushButton("Choose Image")
        self.file_btn.clicked.connect(self.select_file)
        self.part_layout.addWidget(self.file_btn)
        self.add_btn = QPushButton("Add Participant")
        self.add_btn.clicked.connect(self.add_participant)
        self.part_layout.addWidget(self.add_btn)
        self.layout.addLayout(self.part_layout)

        # Selected file path
        self.selected_file = None

        # Refresh Timer
        self.timer = QTimer()
        self.timer.timeout.connect(self.refresh_votes)
        self.timer.start(5000)  # every 5 seconds

        self.refresh_votes()

    def select_file(self):
        fname, _ = QFileDialog.getOpenFileName(self, "Select Participant Image", "", "Images (*.jpg *.png)")
        if fname:
            self.selected_file = fname

    def add_participant(self):
        username = self.username_input.text()
        if not username or not self.selected_file:
            return
        files = {"file": open(self.selected_file, "rb")}
        response = requests.post(f"{BACKEND_URL}/add_participant?username={username}", files=files)
        print(response.json())

    def refresh_votes(self):
        try:
            response = requests.get(f"{BACKEND_URL}/admin/results")
            data = response.json()
            if data.get("success"):
                results = data["results"]
                self.table.setRowCount(len(results))
                for i, c in enumerate(results):
                    self.table.setItem(i, 0, QTableWidgetItem(c["name"]))
                    self.table.setItem(i, 1, QTableWidgetItem(str(c["votes"])))
        except Exception as e:
            print("Error refreshing:", e)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    dashboard = VotingDashboard()
    dashboard.show()
    sys.exit(app.exec_())