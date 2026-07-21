 const mosaic = document.getElementById('mosaic');
  const cols = 12, rows = 12;
  for(let i=0;i<cols*rows;i++){
    const bar = document.createElement('i');
    const h = 8 + Math.round(Math.random()*34);
    bar.style.height = h + 'px';
    bar.style.animationDelay = (Math.random()*3.6).toFixed(2) + 's';
    mosaic.appendChild(bar);
  }


  const API_BASE = 'http://localhost:5000';

  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('pass');
  const errorEl = document.getElementById('login-error');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function clearError() {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  async function handleLogin() {
    clearError();
    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      showError('Veuillez remplir tous les champs.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion...';

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || 'Échec de la connexion.');
        return;
      }

    
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

  
      window.location.href = '../dashboard/dashboard.html';
    } catch (err) {
      console.error(err);
      showError('Impossible de contacter le serveur.');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Se connecter';
    }
  }

  loginBtn.addEventListener('click', handleLogin);
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });