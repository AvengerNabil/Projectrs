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

# ================= FUNCTIONS =================
def add_item():
    if name_entry.get() == "" or price_entry.get() == "" or qty_entry.get() == "":
        messagebox.showerror("Error", "All fields are required")
        return

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
    clear_fields()
    view_items()
    messagebox.showinfo("Success", "Item Added Successfully")

def view_items():
    listbox.delete(0, tk.END)
    cursor.execute("SELECT * FROM clothes")
    rows = cursor.fetchall()
    for row in rows:
        listbox.insert(tk.END, row)

def select_item(event):
    try:
        selected = listbox.get(listbox.curselection())
        id_entry.delete(0, tk.END)
        name_entry.delete(0, tk.END)
        category_entry.delete(0, tk.END)
        size_entry.delete(0, tk.END)
        price_entry.delete(0, tk.END)
        qty_entry.delete(0, tk.END)

        id_entry.insert(0, selected[0])
        name_entry.insert(0, selected[1])
        category_entry.insert(0, selected[2])
        size_entry.insert(0, selected[3])
        price_entry.insert(0, selected[4])
        qty_entry.insert(0, selected[5])
    except:
        pass

def update_item():
    if id_entry.get() == "":
        messagebox.showerror("Error", "Select an item to update")
        return

    cursor.execute("""
    UPDATE clothes SET
    name=?,
    category=?,
    size=?,
    price=?,
    quantity=?
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
    messagebox.showinfo("Success", "Item Updated")

def delete_item():
    if id_entry.get() == "":
        messagebox.showerror("Error", "Select an item to delete")
        return

    cursor.execute("DELETE FROM clothes WHERE id=?", (id_entry.get(),))
    conn.commit()
    clear_fields()
    view_items()
    messagebox.showinfo("Deleted", "Item Deleted")

def clear_fields():
    id_entry.delete(0, tk.END)
    name_entry.delete(0, tk.END)
    category_entry.delete(0, tk.END)
    size_entry.delete(0, tk.END)
    price_entry.delete(0, tk.END)
    qty_entry.delete(0, tk.END)

# ================= GUI =================
root = tk.Tk()
root.title("Clothes Shop Management System")
root.geometry("800x500")
root.config(bg="#f2f2f2")

title = tk.Label(root, text="Clothes Shop Management System",
                 font=("Arial", 18, "bold"), bg="#f2f2f2")
title.pack(pady=10)

# ===== Form =====
frame = tk.Frame(root, bg="#f2f2f2")
frame.pack()

tk.Label(frame, text="ID").grid(row=0, column=0)
tk.Label(frame, text="Name").grid(row=1, column=0)
tk.Label(frame, text="Category").grid(row=2, column=0)
tk.Label(frame, text="Size").grid(row=3, column=0)
tk.Label(frame, text="Price").grid(row=4, column=0)
tk.Label(frame, text="Quantity").grid(row=5, column=0)

id_entry = tk.Entry(frame)
name_entry = tk.Entry(frame)
category_entry = tk.Entry(frame)
size_entry = tk.Entry(frame)
price_entry = tk.Entry(frame)
qty_entry = tk.Entry(frame)

id_entry.grid(row=0, column=1)
name_entry.grid(row=1, column=1)
category_entry.grid(row=2, column=1)
size_entry.grid(row=3, column=1)
price_entry.grid(row=4, column=1)
qty_entry.grid(row=5, column=1)

# ===== Buttons =====
btn_frame = tk.Frame(root, bg="#f2f2f2")
btn_frame.pack(pady=10)

tk.Button(btn_frame, text="Add Item", width=12, command=add_item).grid(row=0, column=0, padx=5)
tk.Button(btn_frame, text="Update Item", width=12, command=update_item).grid(row=0, column=1, padx=5)
tk.Button(btn_frame, text="Delete Item", width=12, command=delete_item).grid(row=0, column=2, padx=5)
tk.Button(btn_frame, text="Clear", width=12, command=clear_fields).grid(row=0, column=3, padx=5)

# ===== Listbox =====
listbox = tk.Listbox(root, width=100)
listbox.pack(pady=10)
listbox.bind("<<ListboxSelect>>", select_item)

view_items()
root.mainloop()
