from flask import Blueprint, render_template, g
from app.auth.jwt_handler import token_required, roles_required
from app.models.user import User
from app.models.attendance import Attendance
from app.models.department import Department

bp = Blueprint('admin', __name__, url_prefix='/admin')

@bp.route('/dashboard')
@roles_required('admin')
def dashboard():
    users = User.get_all()
    stats = Attendance.get_stats_today()
    
    total_users = len(users)
    total_students = len([u for u in users if u['role'] == 'student'])
    total_teachers = len([u for u in users if u['role'] == 'teacher'])
    total_staff = len([u for u in users if u['role'] == 'staff'])
    
    recent_attendance = Attendance.get_all(date_filter=None)[:10] # Last 10
    
    return render_template('admin/dashboard.html', 
        user=g.user,
        stats={
            'total_users': total_users,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_staff': total_staff,
            'present_today': stats.get('present', 0),
            'late_today': stats.get('late', 0),
            'absent_today': stats.get('absent', 0)
        },
        recent_attendance=recent_attendance
    )

@bp.route('/users')
@roles_required('admin')
def users():
    all_users = User.get_all()
    return render_template('admin/users.html', user=g.user, users=all_users)

@bp.route('/departments')
@roles_required('admin')
def departments():
    depts = Department.get_all()
    return render_template('admin/departments.html', user=g.user, departments=depts)
