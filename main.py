from student import Student
from mess import Mess
from calculation import calculate_mess

student = Student()
mess = Mess()

while True:
    print("\n--- HOSTEL MANAGEMENT SYSTEM ---")
    print("1. Add New Hostel Member")
    print("2. View Members")
    print("3. Add Mess Money")
    print("4. Add Meal Entry")
    print("5. Calculate Mess")
    print("6. Exit")

    ch = input("Choose: ")

    if ch == "1":
        name = input("Name: ")
        roll = input("Roll: ")
        dept = input("Department: ")
        room = input("Room No: ")
        student.add_student(name, roll, dept, room)

    elif ch == "2":
        student.view_students()

    elif ch == "3":
        roll = input("Student Roll: ")
        amount = int(input("Amount: "))
        mess.add_money(roll, amount)

    elif ch == "4":
        roll = input("Student Roll: ")
        date = input("Date (YYYY-MM-DD): ")
        meals = int(input("Meals: "))
        mess.add_meal(roll, date, meals)

    elif ch == "5":
        calculate_mess()

    elif ch == "6":
        print("Bye mama ❤️")
        break

    else:
        print("Invalid choice!")
