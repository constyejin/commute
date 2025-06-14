const confirmBtn = document.getElementById('confirmBackgroundBtn');
const resetBtn = document.getElementById('resetBackground');
let pendingImageData = null;

// 배경 이미지 적용
function applyBackgroundImage(imageData) {
  document.body.style.backgroundImage = `url(${imageData})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  localStorage.setItem('customBackground', imageData);
}

// File 변환
function readFileAsDataURL(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

// 파일 선택
bgFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    readFileAsDataURL(file, (dataUrl) => {
      pendingImageData = dataUrl; 
    });
  }
});

// 드래그 드롭
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
    bgFileInput.files = e.dataTransfer.files;
    readFileAsDataURL(file, (dataUrl) => {
      pendingImageData = dataUrl;
    });
  }
});

// 이미지 등록 후 모달 숨김
confirmBtn.addEventListener('click', () => {
  if (pendingImageData) {
    applyBackgroundImage(pendingImageData);
    pendingImageData = null;

    const modalElement = document.getElementById('settingModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
});

// 초기화
resetBtn.addEventListener('click', () => {
  localStorage.removeItem('customBackground');
  document.body.style.backgroundImage = '';
  pendingImageData = null;
  bgFileInput.value = '';
});

// 로컬스토리지에서 배경 복원
function loadBackgroundFromStorage() {
  const saved = localStorage.getItem('customBackground');
  if (saved) {
    applyBackgroundImage(saved);
  }
}
loadBackgroundFromStorage();
