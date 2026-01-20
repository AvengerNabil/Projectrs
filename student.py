import sqlite3

class Student:

    def add_student(self, name, roll, dept, room):
        conn = sqlite3.connect("hostel.db")
        cur = conn.cursor()

        try:
            cur.execute("""
                INSERT INTO students (name, roll, department, room_no)
                VALUES (?,?,?,?)
            """, (name, roll, dept, room))

            conn.commit()
            print("✅ New Hostel Member Added Successfully")

        except sqlite3.IntegrityError:
            print("❌ Roll already exists! Use a unique roll.")

        conn.close()

    def view_students(self):
        conn = sqlite3.connect("hostel.db")
        cur = conn.cursor()

        cur.execute("SELECT roll, name, department, room_no FROM students")
        data = cur.fetchall()

        if not data:
            print("⚠️ No members found")
        else:
            print("\n--- HOSTEL MEMBERS LIST ---")
            for s in data:
                print(f"Roll: {s[0]}, Name: {s[1]}, Dept: {s[2]}, Room: {s[3]}")

        conn.close()
