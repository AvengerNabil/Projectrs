// Theme Management
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        btn.innerText = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light-mode');
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        btn.innerText = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark-mode');
    }
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    
    if (savedTheme === 'light-mode') {
        body.classList.replace('dark-mode', 'light-mode');
        if (btn) btn.innerText = '🌙 Dark Mode';
    }
});
