import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Ensure instance directory exists for SQLite db
    os.makedirs('instance', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)
