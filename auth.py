def login():
    username = input("Admin Name: ")
    password = input("Password: ")

    if username == "Nabil" and password == "123":
        print("✅ Login Successful. Welcome Admin Nabil!")
        return True
    else:
        print("❌ Wrong Admin Name or Password")
        return False
