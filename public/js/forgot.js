document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.innerHTML = 'Sending...';
  try {
    const res = await fetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: e.target.email.value }),
    });
    const data = await res.json();
    alert(data.message || 'Check your email for reset instructions.');
    btn.innerHTML = 'Send Reset Link<span class="material-symbols-outlined">arrow_forward</span>';
    btn.disabled = false;
  } catch (err) {
    alert('Network error');
    btn.disabled = false;
  }
});
