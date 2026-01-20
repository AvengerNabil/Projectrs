import tkinter as tk
from tkinter import messagebox
import math

# ---------------- FUNCTIONS ---------------- #
history = []


# Button click handler
def click(event):
    text = event.widget.cget("text")

    if text == "=":
        try:
            expr = entry.get()
            # Evaluate safely using math module
            result = eval(expr, {"__builtins__": None}, math.__dict__)
            entry.delete(0, tk.END)
            entry.insert(tk.END, str(result))
            history.append(expr + " = " + str(result))
            update_history()
        except Exception:
            entry.delete(0, tk.END)
            entry.insert(tk.END, "Error")
    elif text == "C":
        entry.delete(0, tk.END)
    elif text == "H":
        show_history()
    elif text in ["sin", "cos", "tan", "log", "ln", "sqrt", "pi", "e"]:
        if text == "ln":
            entry.insert(tk.END, "log(")
        elif text == "pi":
            entry.insert(tk.END, str(math.pi))
        elif text == "e":
            entry.insert(tk.END, str(math.e))
        else:
            entry.insert(tk.END, f"{text}(")
    else:
        entry.insert(tk.END, text)


def update_history():
    history_text.config(state=tk.NORMAL)
    history_text.delete("1.0", tk.END)
    for item in history[-10:]:
        history_text.insert(tk.END, item + "\n")
    history_text.config(state=tk.DISABLED)


def show_history():
    messagebox.showinfo("History", "\n".join(history[-10:]))


# Unit conversion
def convert_unit():
    try:
        value = float(unit_input.get())
        choice = conversion_var.get()

        if choice == "km → m":
            result = value * 1000
        elif choice == "m → km":
            result = value / 1000
        elif choice == "m → cm":
            result = value * 100
        elif choice == "cm → m":
            result = value / 100
        elif choice == "°C → °F":
            result = (value * 9 / 5) + 32
        elif choice == "°F → °C":
            result = (value - 32) * 5 / 9
        elif choice == "kg → g":
            result = value * 1000
        elif choice == "g → kg":
            result = value / 1000
        else:
            result = "Unknown"

        unit_result.config(text=str(result))
        history.append(f"{value} {choice} = {result}")
        update_history()
    except:
        unit_result.config(text="Error")


# ---------------- GUI SETUP ---------------- #
root = tk.Tk()
root.title("JOSS MathDA Calculator")
root.geometry("500x700")
root.configure(bg="#1E1E2F")  # dark background
root.resizable(False, False)

# Entry box
entry = tk.Entry(root, font=("Arial", 22), borderwidth=0, bg="#25253C", fg="#FFFFFF", insertbackground='white')
entry.pack(fill=tk.BOTH, ipadx=8, pady=10, padx=10)

# Button frame
frame = tk.Frame(root, bg="#1E1E2F")
frame.pack()

buttons = [
    "7", "8", "9", "/", "C",
    "4", "5", "6", "*", "H",
    "1", "2", "3", "-", "(",
    "0", ".", "=", "+", " )",
    "sin", "cos", "tan", "log", "ln",
    "sqrt", "pi", "e", "**", "%"
]


def style_button(btn):
    btn.config(font=("Arial", 14), width=6, height=2, bg="#2E2E50", fg="#FFFFFF", activebackground="#4B4B7D",
               activeforeground="#FFFFFF", borderwidth=0)
    btn.bind("<Enter>", lambda e: btn.config(bg="#4B4B7D"))
    btn.bind("<Leave>", lambda e: btn.config(bg="#2E2E50"))


row = 0
col = 0
for b in buttons:
    button = tk.Button(frame, text=b)
    style_button(button)
    button.grid(row=row, column=col, padx=3, pady=3)
    button.bind("<Button-1>", click)
    col += 1
    if col > 4:
        col = 0
        row += 1

# History panel
history_label = tk.Label(root, text="History (Last 10):", font=("Arial", 12), fg="#FFFFFF", bg="#1E1E2F")
history_label.pack(pady=(10, 0))
history_text = tk.Text(root, height=6, font=("Arial", 12), bg="#25253C", fg="#FFFFFF", borderwidth=0)
history_text.pack(fill=tk.BOTH, padx=10)
history_text.config(state=tk.DISABLED)

# Unit conversion panel
unit_frame = tk.LabelFrame(root, text="Unit Converter", font=("Arial", 12), fg="#FFFFFF", bg="#1E1E2F")
unit_frame.pack(fill=tk.BOTH, padx=10, pady=10)

unit_input = tk.Entry(unit_frame, font=("Arial", 16), bg="#25253C", fg="#FFFFFF", insertbackground='white')
unit_input.grid(row=0, column=0, padx=5, pady=5)

conversion_var = tk.StringVar()
conversion_var.set("km → m")
conversion_options = ["km → m", "m → km", "m → cm", "cm → m", "°C → °F", "°F → °C", "kg → g", "g → kg"]
conversion_menu = tk.OptionMenu(unit_frame, conversion_var, *conversion_options)
conversion_menu.config(font=("Arial", 12), bg="#2E2E50", fg="#FFFFFF", activebackground="#4B4B7D",
                       activeforeground="#FFFFFF", width=10)
conversion_menu["menu"].config(bg="#2E2E50", fg="#FFFFFF")
conversion_menu.grid(row=0, column=1, padx=5, pady=5)

convert_btn = tk.Button(unit_frame, text="Convert", font=("Arial", 12), bg="#2E2E50", fg="#FFFFFF",
                        activebackground="#4B4B7D", activeforeground="#FFFFFF", command=convert_unit, borderwidth=0)
convert_btn.grid(row=0, column=2, padx=5, pady=5)

unit_result = tk.Label(unit_frame, text="", font=("Arial", 16), fg="#00FFFF", bg="#1E1E2F")
unit_result.grid(row=1, column=0, columnspan=3, pady=10)

# Run the app
root.mainloop()
