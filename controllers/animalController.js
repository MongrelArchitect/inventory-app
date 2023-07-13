const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types;
const Animal = require('../models/animal');
const Category = require('../models/category');
require('../models/category');

// display list of animals
exports.animalList = asyncHandler(async (req, res, next) => {
  const allAnimals = await Animal.find({}, 'commonName url').sort({
    commonName: 1,
  });
  res.render('animalList', { animals: allAnimals, title: 'All Animals' });
});

// display individual animal detail
exports.animalDetail = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    const animal = await Animal.findOne({ _id: req.params.id }).populate(
      'category',
      'name url',
    );
    // need id parameter if we got a valid id but no animial found
    res.render('animalDetail', { animal, id: req.params.id });
  } else {
    // invalid id in the url
    res.render('animalDetail', { id: req.params.id });
  }
});

// show new animal form
exports.getNewAnimalForm = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({}, 'name');
  res.render('animalForm', { categories, title: 'New Animal' });
});

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

  body('category').trim().escape(),

  body('price', 'Price must be 0 or larger')
    .trim()
    .escape()
    .custom((value) => {
      // check if the value is a non-negativ int or float
      if (!+value || +value < 0) {
        return false;
      }
      return true;
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
      const animalExists = await Animal
        .findOne({ speciesName: req.body.speciesName })
        // we have a case-insensitive index in our database
        .collation({ locale: 'en', strength: 1 });
      if (animalExists) {
        // already in our inventory, redirect to its detail page
        res.redirect(animalExists.url);
      } else {
        // save our new animal and redirect to its detail page
        await animal.save();
        res.redirect(animal.url);
      }
    }
  }),
];
