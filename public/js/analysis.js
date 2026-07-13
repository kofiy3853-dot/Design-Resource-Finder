(async function poll() {
  const root = document.getElementById('page-root');
  if (!root || root.dataset.status !== 'processing') return;
  const id = root.dataset.analysisId;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const r = await fetch('/api/analysis/' + id + '/status');
      const d = await r.json();
      if (d.status === 'completed' || d.status === 'failed') {
        location.reload();
        return;
      }
    } catch (_) {
      /* ignore fetch errors during poll */
    }
  }
  location.reload();
})();

document.querySelectorAll('.sidebar-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

async function toggleSave() {
  const btn = document.getElementById('saveBtn');
  const icon = document.getElementById('saveIcon');
  const label = document.getElementById('saveLabel');
  btn.disabled = true;
  try {
    const root = document.getElementById('page-root');
    const res = await fetch('/api/saved/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: root ? parseInt(root.dataset.analysisId) : null }),
    });
    const data = await res.json();
    if (data.saved) {
      icon.textContent = 'bookmark_added';
      label.textContent = 'Saved';
    } else {
      icon.textContent = 'bookmark';
      label.textContent = 'Save';
    }
  } catch (_) {
    /* ignore save errors */
  }
  btn.disabled = false;
}

function copyColor(hex) {
  navigator.clipboard
    .writeText(hex)
    .then(() => showToast('Copied ' + hex))
    .catch(() => showToast('Failed to copy'));
}

function copyFontName(name) {
  navigator.clipboard
    .writeText(name)
    .then(() => showToast('Copied font: ' + name))
    .catch(() => showToast('Failed to copy'));
}

function copyText(t) {
  navigator.clipboard
    .writeText(t)
    .then(() => showToast('Copied to clipboard'))
    .catch(() => showToast('Failed to copy'));
}

function copyCSSVariables(colors) {
  const css = colors
    .map((c) => `--color-${c.name || c.hex.replace('#', '')}: ${c.hex};`)
    .join('\n');
  navigator.clipboard
    .writeText(':root {\n' + css + '\n}')
    .then(() => showToast('CSS variables copied'))
    .catch(() => showToast('Failed to copy'));
}

function copyTailwindConfig(colors) {
  const config = colors
    .map((c) => `  '${c.name || c.hex.replace('#', '')}': '${c.hex}',`)
    .join('\n');
  const output = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${config}\n      },\n    },\n  },\n};`;
  navigator.clipboard
    .writeText(output)
    .then(() => showToast('Tailwind config copied'))
    .catch(() => showToast('Failed to copy'));
}

function shareAnalysis() {
  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => showToast('Link copied to clipboard'))
    .catch(() => showToast('Failed to copy'));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast glass-card px-md py-sm rounded-xl flex items-center gap-xs';
  t.innerHTML =
    '<span class="material-symbols-outlined text-primary text-[18px]">check_circle</span><span class="font-body-md text-body-md text-on-surface text-sm">' +
    msg +
    '</span>';
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity 0.3s';
    setTimeout(() => t.remove(), 300);
  }, 2500);
}

// Keyboard navigation for tabs
document.addEventListener('keydown', (e) => {
  if (e.target.matches('.sidebar-btn')) {
    const tabs = Array.from(document.querySelectorAll('.sidebar-btn'));
    const index = tabs.indexOf(e.target);
    let newIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') newIndex = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      newIndex = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') newIndex = 0;
    if (e.key === 'End') newIndex = tabs.length - 1;
    if (newIndex !== index) {
      e.preventDefault();
      tabs[newIndex].focus();
      tabs[newIndex].click();
    }
  }
});
