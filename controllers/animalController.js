const asyncHandler = require('express-async-handler');
const Animal = require('../models/animal');

// Display list of animals
exports.animalList = asyncHandler(async (req, res, next) => {
  const allAnimals = await Animal
    .find({}, 'commonName url')
    .sort({ commonName: 1 });
  res.render('animalList', { animals: allAnimals, title: 'All Animals' });
});
