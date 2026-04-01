/* Tihtina Guest Platform - Main App Logic */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Language
    if (window.lang) {
        window.lang.init();
    }

    // Initialize UI Components
    initBottomNav();
    initTheme();
});

function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initTheme() {
    const theme = localStorage.getItem('tihtina_theme') || 'light';
    document.body.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('tihtina_theme', newTheme);
}

// Export functions for global use if needed
window.toggleTheme = toggleTheme;
