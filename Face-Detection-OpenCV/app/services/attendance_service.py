import datetime
from flask import current_app
from app.models.attendance import Attendance
from app.models.user import User

class AttendanceService:
    @staticmethod
    def process_recognition(user_id):
        """
        Called when a face is recognized.
        Checks rules and marks attendance if valid.
        """
        user = User.get_by_id(user_id)
        if not user:
            return None, "User not found"
            
        # Check if already marked today
        existing = Attendance.get_today_by_user(user_id)
        if existing:
            status_cap = existing['status'].capitalize()
            return existing, f"Already marked today ({status_cap})"
            
        # Calculate status (Present vs Late)
        now = datetime.datetime.now()
        check_in_time = now.strftime("%H:%M:%S")
        
        office_start = current_app.config.get('OFFICE_START_TIME', "08:00")
        late_threshold = current_app.config.get('LATE_THRESHOLD_MINUTES', 15)
        
        start_dt = datetime.datetime.strptime(office_start, "%H:%M")
        start_dt = start_dt.replace(year=now.year, month=now.month, day=now.day)
        
        cutoff_dt = start_dt + datetime.timedelta(minutes=late_threshold)
        
        status = 'present'
        if now > cutoff_dt:
            status = 'late'
            
        # Mark it
        success = Attendance.mark(user_id, status, check_in_time)
        if success:
            return Attendance.get_today_by_user(user_id), f"Marked as {status.capitalize()}"
        return None, "Failed to mark attendance"
