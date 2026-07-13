let selectedFile = null;
let isProcessing = false;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewState = document.getElementById('previewState');
const uploadState = document.getElementById('uploadState');
const processingState = document.getElementById('processingState');
const errorState = document.getElementById('errorState');
const settingsArea = document.getElementById('settingsArea');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileDims = document.getElementById('fileDims');
const removeFile = document.getElementById('removeFile');
const replaceFile = document.getElementById('replaceFile');
const analyzeBtn = document.getElementById('analyzeBtn');
const progressBarFull = document.getElementById('progressBarFull');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const file = new File([blob], 'clipboard.png', { type });
          handleFile(file);
          return;
        }
      }
    }
    alert('No image found in clipboard');
  } catch (_) {
    alert('Clipboard access denied or no image');
  }
});

function handleFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    showError('Unsupported File Type', 'Please upload a PNG, JPG, WEBP, SVG, or PDF file.');
    return;
  }
  if (file.size > 20971520) {
    showError('File Too Large', 'Maximum file size is 20 MB. Please compress and try again.');
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    const img = new Image();
    img.onload = () => {
      fileDims.textContent = img.width + ' × ' + img.height;
    };
    img.src = URL.createObjectURL(file);
  } else {
    previewImage.src = '';
    previewImage.alt = 'PDF Document';
    fileDims.textContent = 'PDF';
  }
  uploadState.classList.add('hidden');
  previewState.classList.remove('hidden');
  settingsArea.classList.remove('hidden');
}

removeFile.addEventListener('click', resetAll);
replaceFile.addEventListener('click', () => fileInput.click());

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile || isProcessing) return;
  isProcessing = true;
  previewState.classList.add('hidden');
  settingsArea.classList.add('hidden');
  processingState.classList.remove('hidden');
  animateSteps();
  const formData = new FormData();
  formData.append('file', selectedFile);
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 15, 85);
    progressBarFull.style.width = progress + '%';
  }, 800);
  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      clearInterval(progressInterval);
      progressBarFull.style.width = '100%';
      await new Promise((r) => setTimeout(r, 800));
      window.location.href = '/analysis/' + data.data.analysisId;
    } else {
      clearInterval(progressInterval);
      if (data.error) {
        showError(
          data.error.title || 'Upload Failed',
          data.error.message || 'Server error',
          data.error.code
        );
      } else {
        showError('Upload Failed', data.error || 'Server error');
      }
    }
  } catch (err) {
    clearInterval(progressInterval);
    showError('Network Error', 'Could not reach the server. Check your connection and try again.');
  }
});

function animateSteps() {
  for (let i = 1; i <= 8; i++) {
    const delay = 400 + i * 1200;
    setTimeout(() => {
      const prev = document.getElementById('step' + (i - 1));
      if (prev) {
        prev.classList.add('done');
        prev.querySelector('span:first-child').textContent = 'check_circle';
        prev.querySelector('span:first-child').className =
          'material-symbols-outlined text-primary text-[18px]';
      }
      const cur = document.getElementById('step' + i);
      if (cur) {
        cur.classList.add('active');
        cur.querySelector('span:nth-child(2)').className =
          'font-body-md text-body-md text-on-surface text-sm';
      }
    }, delay);
  }
}

function showError(title, msg, code = null) {
  isProcessing = false;
  processingState.classList.add('hidden');
  errorState.classList.remove('hidden');
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = msg;
  document.getElementById('errorTitle2').textContent = title;
  document.getElementById('errorMessage2').textContent = msg;
}

function resetAll() {
  selectedFile = null;
  isProcessing = false;
  errorState.classList.add('hidden');
  processingState.classList.add('hidden');
  previewState.classList.add('hidden');
  settingsArea.classList.add('hidden');
  uploadState.classList.remove('hidden');
  progressBarFull.style.width = '0%';
  for (let i = 1; i <= 8; i++) {
    const s = document.getElementById('step' + i);
    if (s) {
      s.classList.remove('done', 'active');
      s.querySelector('span:first-child').className =
        'material-symbols-outlined text-secondary text-[18px]';
      const icons = [
        '',
        'psychology',
        'text_fields',
        'palette',
        'image',
        'grid_view',
        'format_align_left',
        'auto_awesome',
        'description',
      ];
      s.querySelector('span:first-child').textContent = icons[i] || 'description';
      s.querySelector('span:nth-child(2)').className =
        'font-body-md text-body-md text-on-surface-variant text-sm';
    }
  }
}
