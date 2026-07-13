document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = 'Signing in...';
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email.value, password: form.password.value }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = data.redirect || '/dashboard';
    } else {
      alert(data.error || 'Login failed');
      btn.disabled = false;
      btn.innerHTML = 'Sign In<span class="material-symbols-outlined">arrow_forward</span>';
    }
  } catch (err) {
    alert('Network error');
    btn.disabled = false;
    btn.innerHTML = 'Sign In<span class="material-symbols-outlined">arrow_forward</span>';
  }
});
