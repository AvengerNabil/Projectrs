import sqlite3

def calculate_mess():
    conn = sqlite3.connect("hostel.db")
    cur = conn.cursor()

    cur.execute("SELECT SUM(amount) FROM mess_money")
    total_money = cur.fetchone()[0] or 0

    cur.execute("SELECT SUM(meals) FROM meals")
    total_meals = cur.fetchone()[0] or 1

    meal_rate = total_money / total_meals

    print("\n--- MESS SUMMARY ---")
    print("Total Money:", total_money)
    print("Total Meals:", total_meals)
    print("Meal Rate:", round(meal_rate, 2))

    cur.execute("SELECT DISTINCT roll FROM meals")
    students = cur.fetchall()

    for s in students:
        roll = s[0]

        cur.execute("SELECT SUM(meals) FROM meals WHERE roll=?", (roll,))
        student_meals = cur.fetchone()[0] or 0

        cur.execute("SELECT SUM(amount) FROM mess_money WHERE roll=?", (roll,))
        student_money = cur.fetchone()[0] or 0

        cost = student_meals * meal_rate
        balance = student_money - cost

        print(f"\nRoll: {roll}")
        print("Meals:", student_meals)
        print("Paid:", student_money)
        print("Cost:", round(cost,2))
        print("Balance:", round(balance,2))

    conn.close()
