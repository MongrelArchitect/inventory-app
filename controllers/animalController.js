const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types;
const Animal = require('../models/animal');
const Category = require('../models/category');
require('../models/category');

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
    // need id parameter if we got a valid id but no animial found
    res.render('animalDetail', { animal, formatPrice, id: req.params.id });
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
      res.render('animalForm', { animal, categories, title: 'Edit Animal' });
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

  // process reques after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // we don't have a legit mongodb _id
      res.render('animalDelete', { id: req.body.id });
    } else {
      // _id is legit, try to delete it
      const deletedAnimal = await Animal.findByIdAndDelete(req.body.id);
      if (deletedAnimal) {
        // success - redirect to the list of all animals
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

  // process request after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // create an animal object with escaped and trimmed data
    const animal = new Animal({
      _id: req.params.id,
      commonName: req.body.commonName,
      speciesName: req.body.speciesName,
      description: req.body.description,
      category: req.body.category,
      price: +req.body.price,
      numberInStock: +req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      // got some errors - render the form again with sanitized data
      const categories = await Category.find({}, 'name');
      res.render('animalForm', {
        animal,
        categories,
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
          // catgory _id is no good, re-render form
          const categories = await Category.find({}, 'name');
          res.render('animalForm', {
            animal,
            categories,
            errors: { category: { msg: 'Invalid category id' } },
            title: 'Edit Animal',
          });
        } else {
          // save our new animal and redirect to its detail page
          const newAnimal = await Animal.findByIdAndUpdate(animal._id, animal);
          res.redirect(newAnimal.url);
        }
      } else {
        // animal _id is not in our database - rerender form
        const categories = await Category.find({}, 'name');
        res.render('animalForm', {
          animal,
          categories,
          errors: { id: { msg: 'Invalid animal id' } },
          title: 'Edit Animal',
        });
      }
    }
  }),
];

// post request to new animal form
exports.postNewAnimalForm = [
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
      commonName: req.body.commonName,
      speciesName: req.body.speciesName,
      description: req.body.description,
      category: req.body.category,
      price: +req.body.price,
      numberInStock: +req.body.numberInStock,
    });

    if (!errors.isEmpty()) {
      // got some errors - render the form again with sanitized data
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
        res.redirect(animalExists.url);
      } else {
        // make sure we weren't given a legit-looking but bogus category _id
        const legitCategory = await Category.findById(animal.category);
        if (!legitCategory) {
          // catgory _id is no good, re-render form
          const categories = await Category.find({}, 'name');
          res.render('animalForm', {
            animal,
            categories,
            errors: { category: { msg: 'Invalid category id' } },
            title: 'New Animal',
          });
        } else {
          // save our new animal and redirect to its detail page
          await animal.save();
          res.redirect(animal.url);
        }
      }
    }
  }),
];
