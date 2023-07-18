const deleteButton = document.querySelector('.delete-image');
const filename = document.querySelector('.filename');
const imageInput = document.querySelector('.edit-image');
const preview = document.querySelector('.preview');

imageInput.addEventListener('input', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      deleteButton.classList.remove('hidden');
      preview.src = e.target.result;
      filename.textContent = file.name;
    };
    reader.readAsDataURL(file);
  } else {
    deleteButton.classList.add('hidden');
    preview.src = '/images/no-image.svg';
    filename.textContent = 'None';
  }
});

deleteButton.addEventListener('click', () => {
  imageInput.value = '';
  preview.src = '/images/no-image.svg';
  filename.textContent = 'None';
  deleteButton.classList.add('hidden');
});
