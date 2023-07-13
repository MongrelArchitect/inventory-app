const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
const Animal = require('../models/animal');
const Category = require('../models/category');
require('../models/category');

// display list of animals
exports.animalList = asyncHandler(async (req, res, next) => {
  const allAnimals = await Animal
    .find({}, 'commonName url')
    .sort({ commonName: 1 });
  res.render('animalList', { animals: allAnimals, title: 'All Animals' });
});

// display individual animal detail
exports.animalDetail = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    const animal = await Animal
      .findOne({ _id: req.params.id })
      .populate('category', 'name url');
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
