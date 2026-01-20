import sqlite3

class Staff:
    def add_staff(self, name, role):
        conn = sqlite3.connect("hostel.db")
        cur = conn.cursor()
        cur.execute("INSERT INTO staff VALUES (NULL,?,?)",
                    (name, role))
        conn.commit()
        conn.close()
        print("✅ Staff Added")
