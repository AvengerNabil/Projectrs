from app.database.db import get_db
import datetime

class Attendance:
    @staticmethod
    def mark(user_id, status, check_in_time=None):
        db = get_db()
        date_today = datetime.date.today().isoformat()
        if not check_in_time:
            check_in_time = datetime.datetime.now().strftime("%H:%M:%S")
            
        try:
            db.execute(
                """
                INSERT INTO attendance (user_id, date, check_in_time, status)
                VALUES (?, ?, ?, ?)
                """,
                (user_id, date_today, check_in_time, status)
            )
            db.commit()
            return True
        except db.IntegrityError:
            # Already marked today
            return False
            
    @staticmethod
    def get_today_by_user(user_id):
        db = get_db()
        date_today = datetime.date.today().isoformat()
        return db.execute(
            "SELECT * FROM attendance WHERE user_id = ? AND date = ?", 
            (user_id, date_today)
        ).fetchone()
        
    @staticmethod
    def get_all(date_filter=None):
        db = get_db()
        query = """
            SELECT a.*, u.name, u.role, d.name as department_name
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
        """
        params = []
        if date_filter and str(date_filter).strip() and str(date_filter).strip().lower() != 'all':
            query += " WHERE a.date = ?"
            params.append(str(date_filter).strip())
            
        query += " ORDER BY a.date DESC, a.check_in_time DESC"
        
        return db.execute(query, params).fetchall()
        
    @staticmethod
    def get_by_user(user_id):
        db = get_db()
        return db.execute(
            "SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC",
            (user_id,)
        ).fetchall()
        
    @staticmethod
    def get_stats_today():
        db = get_db()
        date_today = datetime.date.today().isoformat()
        stats = db.execute(
            """
            SELECT status, COUNT(*) as count 
            FROM attendance 
            WHERE date = ? 
            GROUP BY status
            """, 
            (date_today,)
        ).fetchall()
        
        result = {'present': 0, 'late': 0, 'absent': 0, 'leave': 0, 'holiday': 0}
        for row in stats:
            result[row['status']] = row['count']
        return result
