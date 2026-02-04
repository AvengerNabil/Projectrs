import tkinter as tk
from tkinter import messagebox

# ================= MAIN WINDOW =================
root = tk.Tk()
root.title("Tic Tac Toe")
root.geometry("350x420")
root.resizable(False, False)
root.configure(bg="#1e1e2e")

# ================= VARIABLES =================
current_player = "X"
board = [""] * 9
buttons = []

X_COLOR = "#ff5555"
O_COLOR = "#55ffff"
BTN_COLOR = "#2a2a3c"
WIN_COLOR = "#50fa7b"


# ================= FUNCTIONS =================
def check_winner():
    win_patterns = [
        (0, 1, 2), (3, 4, 5), (6, 7, 8),
        (0, 3, 6), (1, 4, 7), (2, 5, 8),
        (0, 4, 8), (2, 4, 6)
    ]

    for a, b, c in win_patterns:
        if board[a] == board[b] == board[c] != "":
            buttons[a].config(bg=WIN_COLOR)
            buttons[b].config(bg=WIN_COLOR)
            buttons[c].config(bg=WIN_COLOR)
            return board[a]

    if "" not in board:
        return "Draw"
    return None


def button_click(i):
    global current_player
    if board[i] == "":
        board[i] = current_player
        color = X_COLOR if current_player == "X" else O_COLOR
        buttons[i].config(text=current_player, fg=color)

        result = check_winner()
        if result == "X" or result == "O":
            messagebox.showinfo("Game Over", f"Player {result} Wins!")
            reset_game()
        elif result == "Draw":
            messagebox.showinfo("Game Over", "It's a Draw!")
            reset_game()
        else:
            current_player = "O" if current_player == "X" else "X"


def reset_game():
    global current_player
    current_player = "X"
    for i in range(9):
        board[i] = ""
        buttons[i].config(text="", bg=BTN_COLOR)


# ================= UI =================
title = tk.Label(
    root,
    text="TIC TAC TOE",
    font=("Arial", 22, "bold"),
    bg="#1e1e2e",
    fg="#f8f8f2"
)
title.pack(pady=10)

frame = tk.Frame(root, bg="#1e1e2e")
frame.pack()

for i in range(9):
    btn = tk.Button(
        frame,
        text="",
        font=("Arial", 22, "bold"),
        width=4,
        height=2,
        bg=BTN_COLOR,
        fg="white",
        activebackground="#44475a",
        command=lambda i=i: button_click(i)
    )
    btn.grid(row=i // 3, column=i % 3, padx=5, pady=5)
    buttons.append(btn)

reset_btn = tk.Button(
    root,
    text="Restart Game",
    font=("Arial", 14, "bold"),
    bg="#6272a4",
    fg="white",
    command=reset_game
)
reset_btn.pack(pady=15)

root.mainloop()
