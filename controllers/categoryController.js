const asyncHandler = require('express-async-handler');
const Category = require('../models/category');
const Animal = require('../models/animal');

// display all categories
exports.categoryList = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({});
  res.render('categoryList', {
    categories: allCategories,
    title: 'Creature Categories',
  });
});

// category detail
exports.categoryDetail = asyncHandler(async (req, res, next) => {
  const [category, animals] = await Promise.all([
    Category.findOne({ _id: req.params.id }),
    Animal.find({}).where({ category: req.params.id }),
  ]);
  res.render('categoryDetail', { animals, category });
});
