document.addEventListener('DOMContentLoaded', () => {
    console.log("Xalapa Verde - Plataforma iniciada correctamente.");
});

function switchView(viewName) {
    document.querySelectorAll('.main-container').forEach(el => el.classList.remove('active'));
    if (viewName === 'welcome') {
        document.getElementById('view-welcome').classList.add('active');
        document.getElementById('header-guest').style.display = 'flex';
        document.getElementById('header-user').style.display = 'none';
    } else if (viewName === 'register') {
        document.getElementById('view-register').classList.add('active');
    } else if (viewName === 'login') {
        document.getElementById('view-login').classList.add('active');
    } else if (viewName === 'dashboard') {
        document.getElementById('view-app').classList.add('active');
        document.getElementById('header-guest').style.display = 'none';
        document.getElementById('header-user').style.display = 'flex';
        document.getElementById('user-display-name').innerText = "Irving Rivera Sayago · ciudadano";
    }
}

function loginSuccess() {
    switchView('dashboard');
}

function logout() {
    switchView('welcome');
}

function switchTab(tabName) {
    document.querySelectorAll('.dashboard-tab').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.sidebar-menu li').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabName).style.display = 'block';
    document.getElementById('menu-' + tabName).classList.add('active');
}
