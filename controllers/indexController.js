const asyncHandler = require('express-async-handler');
const Animal = require('../models/animal');
const Category = require('../models/category');

const formatPrice = (price) => price.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
});

exports.getIndex = asyncHandler(async (req, res, next) => {
  const allAnimals = await Animal.find({}, 'numberInStock price');
  const animalCount = allAnimals.reduce(
    (acc, curr) => acc + curr.numberInStock,
    0,
  );
  const categoryCount = await Category.find({}).countDocuments();
  const speciesCount = allAnimals.length;
  const totalValue = formatPrice(
    allAnimals.reduce((acc, curr) => acc + curr.numberInStock * curr.price, 0),
  );
  res.render('index', {
    animalCount,
    categoryCount,
    description: 'Your premier source for live invertebrates of all kinds!',
    speciesCount,
    title: 'The Invertebratorium',
    totalValue,
  });
});
