const asyncHandler = require('express-async-handler');
const Animal = require('../models/animal');
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
  const animal = await Animal
    .findOne({ _id: req.params.id })
    .populate('category', 'name url');
  res.render('animalDetail', { animal });
});
