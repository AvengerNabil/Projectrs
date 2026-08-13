from flask import Blueprint, render_template, Response, g, request
from app.auth.jwt_handler import token_required, roles_required
from app.models.attendance import Attendance
from app.services.report_service import ReportService
import datetime

bp = Blueprint('attendance', __name__, url_prefix='/attendance')

@bp.route('/')
@roles_required('admin')
def index():
    date_filter = request.args.get('date', datetime.date.today().isoformat())
    records = Attendance.get_all(date_filter=date_filter)
    return render_template('admin/attendance.html', user=g.user, records=records, current_date=date_filter)

@bp.route('/export')
@roles_required('admin')
def export():
    date_filter = request.args.get('date')
    records = Attendance.get_all(date_filter=date_filter)
    
    # If filtered date has no records, fallback to all records so CSV is not empty
    if not records and date_filter:
        records = Attendance.get_all(date_filter=None)
        
    csv_data = ReportService.generate_csv(records)
    filename = f"attendance_report_{date_filter if date_filter and date_filter != 'all' else 'all'}.csv"
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"}
    )
