// Handle Auth Tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const formId = tab.dataset.tab === 'login' ? 'login-form' : 'register-form';
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(formId).classList.add('active');
    });
});

// Register
document.getElementById('register-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
    });
    
    const data = await response.json();
    alert(data.message);
    if (data.success) {
        document.querySelector('[data-tab="login"]').click();
    }
});

// Login
document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const role = document.querySelector('input[name="loginRole"]:checked').value;
    
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
    });
    
    const data = await response.json();
    if (data.success) {
        window.location.href = data.redirect;
    } else {
        alert(data.message);
    }
});