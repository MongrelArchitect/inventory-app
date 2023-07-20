const validate = () => {
  const allValid = {
    commonName: false,
    speciesName: false,
    // optional, always true
    description: true,
    category: false,
    // starts at 0 which is valid
    price: true,
    // starts at 0 which is valid
    numberInStock: true,
    // optional, true if empty
    image: true,
    password: false,
  };

  // need to do this when editing, otherwise won't be ablue to submit
  const setAllValidExceptPassword = () => {
    Object.keys(allValid).forEach((key) => {
      if (key !== 'password') {
        allValid[key] = true;
      }
    });
  };

  const submit = document.querySelector('#submit');
  const idError = document.querySelector('#idError');
  const allowSubmitIfAllValid = () => {
    const goodToGo = Object.values(allValid).every((value) => value === true);

    if (goodToGo) {
      submit.removeAttribute('disabled');
      idError.className = 'valid';
      idError.textContent = 'Good to go!';
    } else {
      submit.setAttribute('disabled', 'true');
      idError.className = 'error';
      idError.textContent = 'Check input fields for errors';
    }
  };

  const commonName = document.querySelector('#commonName');
  const commonNameError = document.querySelector('#commonNameError');

  commonName.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.commonName = valid;
    if (valid) {
      commonNameError.className = 'valid';
      commonNameError.textContent = 'Looks good!';
    } else {
      commonNameError.className = 'error';
      commonNameError.textContent = '2 characters minimum';
    }
    allowSubmitIfAllValid();
  });

  const speciesName = document.querySelector('#speciesName');
  const speciesNameError = document.querySelector('#speciesNameError');

  speciesName.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.speciesName = valid;
    if (valid) {
      speciesNameError.className = 'valid';
      speciesNameError.textContent = 'Looks good!';
    } else {
      speciesNameError.className = 'error';
      speciesNameError.textContent = '5 characters minimum';
    }
    allowSubmitIfAllValid();
  });

  const description = document.querySelector('#description');
  const descriptionError = document.querySelector('#descriptionError');

  description.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.description = valid;
    if (valid) {
      descriptionError.className = 'valid';
      descriptionError.textContent = 'Looks good!';
    } else {
      descriptionError.className = 'error';
      descriptionError.textContent = 'Invalid description';
    }
    allowSubmitIfAllValid();
  });

  const category = document.querySelector('#category');
  const categoryError = document.querySelector('#categoryError');

  category.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.category = valid;
    if (valid) {
      categoryError.className = 'valid';
      categoryError.textContent = 'Looks good!';
    } else {
      categoryError.className = 'error';
      categoryError.textContent = 'Choose a category';
    }
    allowSubmitIfAllValid();
  });

  const price = document.querySelector('#price');
  const priceError = document.querySelector('#priceError');

  price.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.price = valid;
    if (valid) {
      priceError.className = 'valid';
      priceError.textContent = 'Looks good!';
    } else {
      priceError.className = 'error';
      priceError.textContent = 'Price must be positive number';
    }
    allowSubmitIfAllValid();
  });

  const numberInStock = document.querySelector('#numberInStock');
  const numberInStockError = document.querySelector('#numberInStockError');

  numberInStock.addEventListener('input', (event) => {
    const { target } = event;
    const { valid } = target.validity;
    allValid.numberInStock = valid;
    if (valid) {
      numberInStockError.className = 'valid';
      numberInStockError.textContent = 'Looks good!';
    } else {
      numberInStockError.className = 'error';
      numberInStockError.textContent = 'Stock must be positive integer';
    }
    allowSubmitIfAllValid();
  });

  // input has different id for new vs editing
  const addImageListener = (image) => {
    const imageError = document.querySelector('#imageError');

    image.addEventListener('change', (event) => {
      const { target } = event;
      const file = target.files[0];
      const allowed = ['image/jpeg', 'image/gif', 'image/png'];
      const maxSize = 5242880;
      let message;

      if (file) {
        if (!allowed.includes(file.type)) {
          message = 'Image must be jpeg, gif or png';
          target.setCustomValidity(message);
        } else if (file.size > maxSize) {
          message = 'Image too large (5MB max)';
          target.setCustomValidity(message);
        } else {
          target.setCustomValidity('');
        }
      } else {
        target.setCustomValidity('');
      }

      target.reportValidity();
      const { valid } = target.validity;
      allValid.image = valid;
      if (valid) {
        imageError.className = 'valid';
        imageError.textContent = 'Looks good!';
      } else {
        imageError.className = 'error';
        imageError.textContent = message;
      }
      allowSubmitIfAllValid();
    });
  };

  // the id we have changes depending on if we're editing or not
  const image = document.querySelector('#image');
  const imageEditing = document.querySelector('#image-editing');
  if (image) {
    addImageListener(image);
  } else {
    addImageListener(imageEditing);
    setAllValidExceptPassword();
  }

  const password = document.querySelector('#password');
  const passwordError = document.querySelector('#passwordError');

  if (password && passwordError) {
    password.addEventListener('input', (event) => {
      const { target } = event;
      const { valid } = target.validity;
      allValid.password = valid;
      if (valid) {
        passwordError.className = 'valid';
        passwordError.textContent = 'Looks good!';
      } else {
        passwordError.className = 'error';
        passwordError.textContent = 'Admin password required';
      }
      allowSubmitIfAllValid();
    });
  } else {
    // new animal form won't have these elements
    allValid.password = true;
  }
};

validate();
