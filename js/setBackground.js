const dropZone = document.getElementById('dropZone');
const bgFileInput = document.getElementById('bgFileInput');
const confirmBtn = document.getElementById('confirmBackgroundBtn');
const resetBtn = document.getElementById('resetBackground');
const targetElement = document.body; // ← 적용할 엘리먼트 변경 가능 (예: document.querySelector('.bg-wrapper'))

// 배경 복원
function loadBackgroundFromStorage() {
  const saved = localStorage.getItem('customBackground');
  if (saved) {
    targetElement.style.backgroundImage = `url(${saved})`;
    targetElement.style.backgroundSize = 'cover';
    targetElement.style.backgroundPosition = 'center';
  }
}

function setBackgroundImage(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;
    targetElement.style.backgroundImage = `url(${imageData})`;
    targetElement.style.backgroundSize = 'cover';
    targetElement.style.backgroundPosition = 'center';
    localStorage.setItem('customBackground', imageData);
  };
  reader.readAsDataURL(file);
}

// 파일 선택
bgFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    setBackgroundImage(file);
  }
});

// 드래그 앤 드롭
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('border-primary');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('border-primary');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('border-primary');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    bgFileInput.files = e.dataTransfer.files; // 미리보기 반영
    setBackgroundImage(file);
  }
});

// 초기화 버튼
resetBtn.addEventListener('click', () => {
  localStorage.removeItem('customBackground');
  targetElement.style.backgroundImage = '';
});

// 확인 버튼
confirmBtn.addEventListener('click', () => {
  const file = bgFileInput.files[0];
  if (file && file.type.startsWith('image/')) {
    setBackgroundImage(file);
  }
});

loadBackgroundFromStorage();
