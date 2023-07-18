const changed = document.querySelector('.changed');
const deleteButton = document.querySelector('.delete-image');
const filename = document.querySelector('.filename');
const imageInput = document.querySelector('.edit-image');
const inputLabel = document.querySelector('.edit-image-label');
const preview = document.querySelector('.preview');

imageInput.addEventListener('input', (event) => {
  changed.setAttribute('value', '1');
  inputLabel.setAttribute('for', 'image');
  imageInput.setAttribute('id', 'image');
  imageInput.setAttribute('name', 'image');
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
  changed.setAttribute('value', '1');
  inputLabel.setAttribute('for', 'image');
  imageInput.setAttribute('id', 'image');
  imageInput.setAttribute('name', 'image');
  imageInput.value = '';
  preview.src = '/images/no-image.svg';
  filename.textContent = 'None';
  deleteButton.classList.add('hidden');
});
