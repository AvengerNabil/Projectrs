import tkinter as tk
from tkinter import messagebox
import sqlite3

# ================= DATABASE =================
conn = sqlite3.connect("clothes_shop.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS clothes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    size TEXT,
    price REAL,
    quantity INTEGER
)
""")
conn.commit()

# ================= COLORS (DARK MODE) =================
BG = "#1e1e1e"
FG = "#ffffff"
BTN = "#3a3a3a"
ENTRY_BG = "#2a2a2a"

# ================= LOGIN WINDOW =================
def login():
    if username_entry.get() == "admin" and password_entry.get() == "1234":
        login_window.destroy()
        main_app()
    else:
        messagebox.showerror("Login Failed", "Invalid Username or Password")

login_window = tk.Tk()
login_window.title("Login")
login_window.geometry("300x200")
login_window.config(bg=BG)

tk.Label(login_window, text="Admin Login", fg=FG, bg=BG,
         font=("Arial", 14, "bold")).pack(pady=10)

tk.Label(login_window, text="Username", fg=FG, bg=BG).pack()
username_entry = tk.Entry(login_window, bg=ENTRY_BG, fg=FG)
username_entry.pack()

tk.Label(login_window, text="Password", fg=FG, bg=BG).pack()
password_entry = tk.Entry(login_window, show="*", bg=ENTRY_BG, fg=FG)
password_entry.pack()

tk.Button(login_window, text="Login", command=login,
          bg=BTN, fg=FG).pack(pady=10)

# ================= MAIN APP =================
def main_app():
    def add_item():
        cursor.execute(
            "INSERT INTO clothes VALUES (NULL,?,?,?,?,?)",
            (
                name_entry.get(),
                category_entry.get(),
                size_entry.get(),
                float(price_entry.get()),
                int(qty_entry.get())
            )
        )
        conn.commit()
        view_items()
        clear_fields()

    def view_items():
        listbox.delete(0, tk.END)
        cursor.execute("SELECT * FROM clothes")
        for row in cursor.fetchall():
            listbox.insert(tk.END, row)

    def select_item(event):
        try:
            item = listbox.get(listbox.curselection())
            id_entry.delete(0, tk.END)
            name_entry.delete(0, tk.END)
            category_entry.delete(0, tk.END)
            size_entry.delete(0, tk.END)
            price_entry.delete(0, tk.END)
            qty_entry.delete(0, tk.END)

            id_entry.insert(0, item[0])
            name_entry.insert(0, item[1])
            category_entry.insert(0, item[2])
            size_entry.insert(0, item[3])
            price_entry.insert(0, item[4])
            qty_entry.insert(0, item[5])
        except:
            pass

    def update_item():
        cursor.execute("""
        UPDATE clothes SET name=?, category=?, size=?, price=?, quantity=?
        WHERE id=?
        """, (
            name_entry.get(),
            category_entry.get(),
            size_entry.get(),
            float(price_entry.get()),
            int(qty_entry.get()),
            id_entry.get()
        ))
        conn.commit()
        view_items()

    def delete_item():
        cursor.execute("DELETE FROM clothes WHERE id=?", (id_entry.get(),))
        conn.commit()
        view_items()
        clear_fields()

    def clear_fields():
        for e in [id_entry, name_entry, category_entry, size_entry, price_entry, qty_entry]:
            e.delete(0, tk.END)

    root = tk.Tk()
    root.title("Clothes Shop Management System")
    root.geometry("850x520")
    root.config(bg=BG)

    tk.Label(root, text="Clothes Shop Management System",
             font=("Arial", 18, "bold"),
             fg=FG, bg=BG).pack(pady=10)

    frame = tk.Frame(root, bg=BG)
    frame.pack()

    labels = ["ID", "Name", "Category", "Size", "Price", "Quantity"]
    entries = []

    for i, text in enumerate(labels):
        tk.Label(frame, text=text, fg=FG, bg=BG).grid(row=i, column=0, padx=5, pady=3)
        entry = tk.Entry(frame, bg=ENTRY_BG, fg=FG)
        entry.grid(row=i, column=1)
        entries.append(entry)

    id_entry, name_entry, category_entry, size_entry, price_entry, qty_entry = entries

    btn_frame = tk.Frame(root, bg=BG)
    btn_frame.pack(pady=10)

    tk.Button(btn_frame, text="Add", width=12, bg=BTN, fg=FG, command=add_item).grid(row=0, column=0, padx=5)
    tk.Button(btn_frame, text="Update", width=12, bg=BTN, fg=FG, command=update_item).grid(row=0, column=1, padx=5)
    tk.Button(btn_frame, text="Delete", width=12, bg=BTN, fg=FG, command=delete_item).grid(row=0, column=2, padx=5)
    tk.Button(btn_frame, text="Clear", width=12, bg=BTN, fg=FG, command=clear_fields).grid(row=0, column=3, padx=5)

    listbox = tk.Listbox(root, width=110, bg=ENTRY_BG, fg=FG)
    listbox.pack(pady=10)
    listbox.bind("<<ListboxSelect>>", select_item)

    view_items()
    root.mainloop()

login_window.mainloop()
