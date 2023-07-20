const validateCategoryForm = () => {
  const name = document.querySelector('#name');
  const nameError = document.querySelector('#nameError');

  const password = document.querySelector('#password');
  const allValid = {
    // this shouldn't change, description is optional
    description: true,
    name: !!password,
    password: !password,
  };

  const submit = document.querySelector('#submit');
  const submitError = document.querySelector('#submitError');
  const submitIfAllValid = () => {
    const goodToGo = Object.values(allValid).every((value) => value === true);

    if (goodToGo) {
      submit.removeAttribute('disabled');
      submitError.className = 'valid';
      submitError.textContent = 'Good to go!';
    } else {
      submit.setAttribute('disabled', 'true');
      submitError.className = 'error';
      submitError.textContent = 'Check input fields';
    }
  };

  name.addEventListener('input', (event) => {
    const { valid } = event.target.validity;

    if (valid) {
      nameError.className = 'valid';
      nameError.textContent = 'Looks good!';
      allValid.name = true;
      submitIfAllValid();
    } else {
      nameError.className = 'error';
      nameError.textContent = '2 characters minimum';
      allValid.name = false;
      submitIfAllValid();
    }
  });

  const description = document.querySelector('#description');
  const descriptionError = document.querySelector('#descriptionError');

  description.addEventListener('input', (event) => {
    const { valid } = event.target.validity;

    if (valid) {
      descriptionError.className = 'valid';
      descriptionError.textContent = 'Looks good!';
      allValid.description = true;
      submitIfAllValid();
    } else {
      description.className = 'error';
      description.textContent = 'Invalid description';
      allValid.description = false;
      submitIfAllValid();
    }
  });

  const passwordError = document.querySelector('#passwordError');

  // will only exist if the form is loaded from /edit GET request
  if (password) {
    password.addEventListener('input', (event) => {
      const { valid } = event.target.validity;

      if (valid) {
        passwordError.className = 'valid';
        passwordError.textContent = 'Looks good!';
        allValid.password = true;
        submitIfAllValid();
      } else {
        passwordError.className = 'error';
        passwordError.textContent = 'Admin password required';
        allValid.password = false;
        submitIfAllValid();
      }
    });
  }
};

validateCategoryForm();
