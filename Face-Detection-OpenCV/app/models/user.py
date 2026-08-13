from app.database.db import get_db

class User:
    @staticmethod
    def create(name, email, password_hash, role, department_id=None, phone=None, image_path=None):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, role, department_id, phone, image_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (name, email, password_hash, role, department_id, phone, image_path)
        )
        db.commit()
        return cursor.lastrowid
        
    @staticmethod
    def get_by_email(email):
        db = get_db()
        return db.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        
    @staticmethod
    def get_by_id(user_id):
        db = get_db()
        return db.execute(
            """
            SELECT u.*, d.name as department_name 
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = ?
            """, (user_id,)
        ).fetchone()
        
    @staticmethod
    def get_all():
        db = get_db()
        return db.execute(
            """
            SELECT u.*, d.name as department_name 
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY u.created_at DESC
            """
        ).fetchall()
        
    @staticmethod
    def delete(user_id):
        db = get_db()
        db.execute("DELETE FROM users WHERE id = ?", (user_id,))
        db.commit()
        
    @staticmethod
    def update_image(user_id, image_path):
        db = get_db()
        db.execute("UPDATE users SET image_path = ? WHERE id = ?", (image_path, user_id))
        db.commit()
