from app.database.db import get_db

class Department:
    @staticmethod
    def create(name):
        db = get_db()
        try:
            cursor = db.cursor()
            cursor.execute("INSERT INTO departments (name) VALUES (?)", (name,))
            db.commit()
            return cursor.lastrowid
        except db.IntegrityError:
            return None # Already exists
            
    @staticmethod
    def get_all():
        db = get_db()
        return db.execute("SELECT * FROM departments ORDER BY name").fetchall()
        
    @staticmethod
    def get_by_id(dept_id):
        db = get_db()
        return db.execute("SELECT * FROM departments WHERE id = ?", (dept_id,)).fetchone()
        
    @staticmethod
    def delete(dept_id):
        db = get_db()
        db.execute("DELETE FROM departments WHERE id = ?", (dept_id,))
        db.commit()
