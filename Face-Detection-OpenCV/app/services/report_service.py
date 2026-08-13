import csv
import io

class ReportService:
    @staticmethod
    def generate_csv(attendance_records):
        """
        Generate CSV string from records
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['ID', 'Date', 'Name', 'Role', 'Department', 'Check-in Time', 'Status'])
        
        for record in attendance_records:
            writer.writerow([
                record['id'],
                record['date'],
                record['name'],
                record['role'],
                record['department_name'] or 'N/A',
                record['check_in_time'],
                record['status'].upper()
            ])
            
        return output.getvalue()
