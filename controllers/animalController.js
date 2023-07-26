const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types;
const multer = require('multer');
const Animal = require('../models/animal');
const Category = require('../models/category');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) console.error(err);
  });
};

const formatPrice = (price) => price.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
});

const getTotalAnimals = (animals) => {
  const total = animals.reduce((acc, curr) => acc + curr.numberInStock, 0);
  return total;
};

const getTotalValue = (animals) => animals.reduce((acc, curr) => {
  const value = acc + curr.numberInStock * curr.price;
  return value;
}, 0);

const moveFile = (filename) => {
  const oldPath = `temp/${filename}`;
  const newPath = `public/images/${filename}`;
  fs.rename(oldPath, newPath, (err) => {
    if (err) console.error(err);
  });
};

const upload = multer({
  storage: multer.diskStorage({
    destination: 'temp/',
    filename: function createFilename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5242880 },
  fileFilter: function filterFile(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported filetype for new animal image'));
    }
  },
});

// display list of animals
exports.animalList = asyncHandler(async (req, res, next) => {
  const allAnimals = await Animal.find({}).sort({
    commonName: 1,
  });
  res.render('animalList', {
    animals: allAnimals,
    formatPrice,
    getTotalAnimals,
    getTotalValue,
    title: 'All Animals',
  });
});

// display individual animal detail
exports.animalDetail = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    const animal = await Animal.findOne({ _id: req.params.id }).populate(
      'category',
      'name url',
    );
    res.render('animalDetail', {
      animal,
      alreadyExists: req.query.alreadyExists,
      formatPrice,
      // need id parameter if we got a valid id but no animial found
      id: req.params.id,
    });
  } else {
    // invalid id in the url
    res.render('animalDetail', { id: req.params.id });
  }
});

// delete animal GET
exports.getDeleteAnimal = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    // our id parameter looks like a legit mongodb _id
    const animal = await Animal.findById(req.params.id);
    if (animal) {
      res.render('animalDelete', { animal });
    } else {
      // no such _id in our database
      res.render('animalDelete', { id: req.params.id });
    }
  } else {
    // not a legit mongodb _id
    res.render('animalDelete', { id: req.params.id });
  }
});

// edit animal detail
exports.getEditAnimal = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    // our id parameter looks like a legit mongodb _id
    const categories = await Category.find({}, 'name');
    const animal = await Animal.findById(req.params.id);
    // check to make sure the id pararmeter matches an actual animal
    if (animal) {
      res.render('animalForm', {
        animal,
        categories,
        // need template to know if we're editing to handle file input
        editing: true,
        title: 'Edit Animal',
      });
    } else {
      // looked like a good id but it wasn't in our database
      res.render('animalForm', { id: req.params.id });
    }
  } else {
    // not a valid mongodb _id
    res.render('animalForm', { id: req.params.id });
  }
});

// show new animal form
exports.getNewAnimalForm = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}, 'name');
  res.render('animalForm', { categories, title: 'New Animal' });
});

// delete animal POST
exports.postDeleteAnimal = [
  body('id', 'Invalid animal id')
    .trim()
    .escape()
    .custom((value) => {
      // make sure we're using a legit mongodb _id in our form
      if (ObjectId.isValid(value)) {
        return true;
      }
      return false;
    }),

  body('password', 'Incorrect admin password').custom((value) => {
    if (value === process.env.PASSWORD) return true;
    return false;
  }),

  // process reques after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (errors.mapped().password) {
        // admin password no good
        const animal = await Animal.findById(req.body.id);
        res.render('animalDelete', { animal, errors: errors.mapped() });
      } else {
        // we don't have a legit mongodb _id
        res.render('animalDelete', { id: req.body.id });
      }
    } else {
      // _id is legit, try to delete it
      const deletedAnimal = await Animal.findByIdAndDelete(req.body.id);
      if (deletedAnimal) {
        // success - delete any associated image and redirect to animal list
        if (deletedAnimal.image) {
          deleteFile(`public/images/${deletedAnimal.image}`);
        }
        res.redirect('/animals');
      } else {
        // _id looked legit but not in our database
        res.render('animalDelete', { id: req.body.id });
      }
    }
  }),
];

// post request to edit animal form
exports.postEditAnimal = [
  // for multer file upload
  upload.single('image'),

  // validate & sanitize user input
  param('id', 'Invalid animal id')
    .trim()
    .escape()
    .custom((value) => {
      // make sure it's a valid mongodb _id
      if (ObjectId.isValid(value)) {
        return true;
      }
      return false;
    }),

  body('commonName', 'Common name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),

  body('speciesName', 'Species name must contain at least 5 characters')
    .trim()
    .isLength({ min: 5 })
    .escape(),

  body('description').optional().trim().escape(),

  body('category', 'Invalid category id')
    .trim()
    .escape()
    .custom((value) => {
      // make sure we have a valid mongodb _id
      if (ObjectId.isValid(value)) {
        return true;
      }
      return false;
    }),

  body('price', 'Price must be 0 or larger')
    .trim()
    .escape()
    .custom((value) => {
      // check if the value is a non-negativ int or float
      const regex = /^(0|[1-9]\d*)(\.\d+)?$/;
      if (regex.test(value)) {
        return true;
      }
      return false;
    }),

  body('numberInStock', 'Stock must be a whole number, 0 or larger')
    .trim()
    .escape()
    .isInt({ min: 0 }),

  body('password', 'Incorrect admin password').custom((value) => {
    if (value === process.env.PASSWORD) return true;
    return false;
  }),

  // process request after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // use the original image (if any) for re-rendering with errors
    const originalAnimal = await Animal.findById(req.params.id, 'image');

    // create an animal object with escaped and trimmed data
    const animal = new Animal({
      _id: req.params.id,
      category: req.body.category,
      commonName: req.body.commonName,
      description: req.body.description,
      image: originalAnimal.image,
      numberInStock: +req.body.numberInStock,
      price: +req.body.price,
      speciesName: req.body.speciesName,
    });

    if (!errors.isEmpty()) {
      // temp image not needed, so delete it
      if (req.file) deleteFile(req.file.path);

      // got some errors - render the form again with sanitized data
      const categories = await Category.find({}, 'name');
      res.render('animalForm', {
        animal,
        categories,
        editing: true,
        errors: errors.mapped(),
        title: 'Edit Animal',
      });
    } else {
      // form data is valid

      // make sure the id parameter matches an animal in our database
      const checkAnimal = await Animal.findById(animal._id);
      if (checkAnimal) {
        // make sure we weren't given a legit-looking but bogus category _id
        const legitCategory = await Category.findById(animal.category);
        if (!legitCategory) {
          // temp image not needed, so delete it
          deleteFile(req.file.path);
          // catgory _id is no good, re-render form
          const categories = await Category.find({}, 'name');
          res.render('animalForm', {
            animal,
            categories,
            editing: true,
            errors: { category: { msg: 'Invalid category id' } },
            title: 'Edit Animal',
          });
        } else {
          // this is taken from a hidden input that front-end script
          // changes from '0' to '1' if the user deletes or changes image
          if (+req.body.imageChanged) {
            // if user changed the image, use the new choice & delete old image
            animal.image = req.file ? req.file.filename : '';
            deleteFile(`public/images/${checkAnimal.image}`);
            // move the uploaded image from temp to public/images
            if (animal.image) moveFile(animal.image);
          } else {
            // otherwise refer to the original document
            animal.image = checkAnimal.image;
          }
          // save our new animal and redirect to its detail page
          const newAnimal = await Animal.findByIdAndUpdate(animal._id, animal);
          res.redirect(newAnimal.url);
        }
      } else {
        // temp image not needed, so delete it
        deleteFile(req.file.path);
        // animal _id is not in our database - rerender form
        const categories = await Category.find({}, 'name');
        res.render('animalForm', {
          animal,
          categories,
          editing: true,
          errors: { id: { msg: 'Invalid animal id' } },
          title: 'Edit Animal',
        });
      }
    }
  }),
];

// post request to new animal form
exports.postNewAnimalForm = [
  // for multer file upload
  upload.single('image'),

  // validate & sanitize user input
  body('commonName', 'Common name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),

  body('speciesName', 'Species name must contain at least 5 characters')
    .trim()
    .isLength({ min: 5 })
    .escape(),

  body('description').optional().trim().escape(),

  body('category', 'Invalid category id')
    .trim()
    .escape()
    .custom((value) => {
      // make sure we have a valid mongodb _id
      if (ObjectId.isValid(value)) {
        return true;
      }
      return false;
    }),

  body('price', 'Price must be 0 or larger')
    .trim()
    .escape()
    .custom((value) => {
      // check if the value is a non-negativ int or float
      const regex = /^(0|[1-9]\d*)(\.\d+)?$/;
      if (regex.test(value)) {
        return true;
      }
      return false;
    }),

  body('numberInStock', 'Stock must be a whole number, 0 or larger')
    .trim()
    .escape()
    .isInt({ min: 0 }),

  // process request after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // create an animal object with escaped and trimmed data
    const animal = new Animal({
      category: req.body.category,
      commonName: req.body.commonName,
      description: req.body.description,
      image: req.file ? req.file.filename : '',
      numberInStock: +req.body.numberInStock,
      price: +req.body.price,
      speciesName: req.body.speciesName,
    });

    if (!errors.isEmpty()) {
      // temp image not needed, so delete it
      deleteFile(req.file.path);

      // render the form again with sanitized data (except file input)
      const categories = await Category.find({}, 'name');
      res.render('animalForm', {
        animal,
        categories,
        errors: errors.mapped(),
        title: 'New Animal',
      });
    } else {
      // form data is valid

      // check if the species is already in our database
      const animalExists = await Animal.findOne({
        speciesName: req.body.speciesName,
      })
        // we have a case-insensitive index in our database
        .collation({ locale: 'en', strength: 1 });
      if (animalExists) {
        // already in our inventory, redirect to its detail page
        if (animal.image) {
          // temp image not needed, so delete it
          deleteFile(req.file.path);
        }
        // query string to tell controller to display "already exists" message
        res.redirect(`${animalExists.url}?alreadyExists=true`);
      } else {
        // make sure we weren't given a legit-looking but bogus category _id
        const legitCategory = await Category.findById(animal.category);
        if (!legitCategory) {
          // temp image not needed, so delete it
          deleteFile(req.file.path);
          // catgory _id is no good, re-render form (except file input)
          const categories = await Category.find({}, 'name');
          res.render('animalForm', {
            animal,
            categories,
            errors: { category: { msg: 'Invalid category id' } },
            title: 'New Animal',
          });
        } else {
          // move the uploaded image from temp to public/images
          if (animal.image) moveFile(animal.image);
          // save our new animal and redirect to its detail page
          await animal.save();
          res.redirect(animal.url);
        }
      }
    }
  }),
];
