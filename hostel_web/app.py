from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

# ---------- DATABASE CONNECTION ----------
def get_db():
    return sqlite3.connect("hostel.db")

# ---------- LOGIN ----------
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = request.form["username"]
        pwd = request.form["password"]

        if user == "Nabil" and pwd == "123":
            return redirect("/dashboard")
        else:
            return "Wrong Login"

    return render_template("login.html")

# ---------- DASHBOARD ----------
@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

# ---------- ADD STUDENT ----------
@app.route("/add-student", methods=["GET", "POST"])
def add_student():
    if request.method == "POST":
        name = request.form["name"]
        roll = request.form["roll"]
        dept = request.form["dept"]
        room = request.form["room"]

        db = get_db()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO students (name, roll, department, room_no) VALUES (?,?,?,?)",
            (name, roll, dept, room)
        )
        db.commit()
        db.close()

        return redirect("/dashboard")

    return render_template("add_student.html")

# ---------- ADD MONEY ----------
@app.route("/add-money", methods=["GET", "POST"])
def add_money():
    if request.method == "POST":
        roll = request.form["roll"]
        amount = request.form["amount"]

        db = get_db()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO mess_money (roll, amount) VALUES (?,?)",
            (roll, amount)
        )
        db.commit()
        db.close()

        return redirect("/dashboard")

    return render_template("add_money.html")

# ---------- ADD MEAL ----------
@app.route("/add-meal", methods=["GET", "POST"])
def add_meal():
    if request.method == "POST":
        roll = request.form["roll"]
        date = request.form["date"]
        meals = request.form["meals"]

        db = get_db()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO meals (roll, date, meals) VALUES (?,?,?)",
            (roll, date, meals)
        )
        db.commit()
        db.close()

        return redirect("/dashboard")

    return render_template("add_meal.html")


if __name__ == "__main__":
    app.run(debug=True)
