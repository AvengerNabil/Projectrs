import sqlite3

def create_database():
    conn = sqlite3.connect("hostel.db")
    cursor = conn.cursor()

    # ================= STUDENT TABLE =================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roll TEXT UNIQUE NOT NULL,
        department TEXT,
        room_no INTEGER,
        fees_paid INTEGER DEFAULT 0
    )
    """)

    # ================= STAFF TABLE =================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL
    )
    """)

    # ================= MESS MONEY TABLE =================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mess_money (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll TEXT NOT NULL,
        amount INTEGER NOT NULL,
        date TEXT
    )
    """)

    # ================= MEALS TABLE =================
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll TEXT NOT NULL,
        date TEXT NOT NULL,
        meals INTEGER NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    print("✅ Database & Tables Created Successfully")


# Run this file directly to create database
if __name__ == "__main__":
    create_database()
