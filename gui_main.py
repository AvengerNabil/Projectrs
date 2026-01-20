import tkinter as tk
from tkinter import messagebox
from student import Student
from mess import Mess
from calculation import calculate_mess

student = Student()
mess = Mess()

root = tk.Tk()
root.title("Hostel Management System")
root.geometry("400x450")

# ---------- FUNCTIONS ----------

def add_student_gui():
    student.add_student(
        name_entry.get(),
        roll_entry.get(),
        dept_entry.get(),
        room_entry.get()
    )
    messagebox.showinfo("Success", "New Member Added")

def add_money_gui():
    mess.add_money(money_roll.get(), int(money_amount.get()))
    messagebox.showinfo("Success", "Money Added")

def add_meal_gui():
    mess.add_meal(meal_roll.get(), meal_date.get(), int(meal_count.get()))
    messagebox.showinfo("Success", "Meal Added")

def calculate_gui():
    calculate_mess()
    messagebox.showinfo("Done", "Check Terminal for Mess Summary")

# ---------- UI ----------

tk.Label(root, text="HOSTEL MANAGEMENT SYSTEM", font=("Arial", 14, "bold")).pack(pady=10)

# ---- Student Section ----
tk.Label(root, text="Add New Member").pack()
name_entry = tk.Entry(root)
roll_entry = tk.Entry(root)
dept_entry = tk.Entry(root)
room_entry = tk.Entry(root)

name_entry.insert(0, "Name")
roll_entry.insert(0, "Roll")
dept_entry.insert(0, "Department")
room_entry.insert(0, "Room No")

name_entry.pack()
roll_entry.pack()
dept_entry.pack()
room_entry.pack()

tk.Button(root, text="Add Member", command=add_student_gui).pack(pady=5)

# ---- Money Section ----
tk.Label(root, text="Add Mess Money").pack()
money_roll = tk.Entry(root)
money_amount = tk.Entry(root)

money_roll.insert(0, "Roll")
money_amount.insert(0, "Amount")

money_roll.pack()
money_amount.pack()

tk.Button(root, text="Add Money", command=add_money_gui).pack(pady=5)

# ---- Meal Section ----
tk.Label(root, text="Add Meal").pack()
meal_roll = tk.Entry(root)
meal_date = tk.Entry(root)
meal_count = tk.Entry(root)

meal_roll.insert(0, "Roll")
meal_date.insert(0, "YYYY-MM-DD")
meal_count.insert(0, "Meals")

meal_roll.pack()
meal_date.pack()
meal_count.pack()

tk.Button(root, text="Add Meal", command=add_meal_gui).pack(pady=5)

# ---- Calculate ----
tk.Button(root, text="Calculate Mess", bg="green", fg="white",
          command=calculate_gui).pack(pady=15)

root.mainloop()
