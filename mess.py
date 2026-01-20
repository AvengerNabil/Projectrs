import sqlite3

class Mess:

    def add_money(self, roll, amount):
        conn = sqlite3.connect("hostel.db")
        cur = conn.cursor()
        cur.execute("INSERT INTO mess_money VALUES (NULL,?,?)",
                    (roll, amount))
        conn.commit()
        conn.close()
        print("✅ Money Added")

    def add_meal(self, roll, date, meals):
        conn = sqlite3.connect("hostel.db")
        cur = conn.cursor()
        cur.execute("INSERT INTO meals VALUES (NULL,?,?,?)",
                    (roll, date, meals))
        conn.commit()
        conn.close()
        print("✅ Meal Added")
