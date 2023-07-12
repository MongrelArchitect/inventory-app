const asyncHandler = require('express-async-handler');
const { ObjectId } = require('mongoose').Types;
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
  if (ObjectId.isValid(req.params.id)) {
    const [category, animals] = await Promise.all([
      Category.findOne({ _id: req.params.id }),
      Animal.find({}).where({ category: req.params.id }),
    ]);
    // need id parameter if we got a valid id but no animial found
    res.render('categoryDetail', { animals, category, id: req.params.id });
  } else {
    // invalid id in the url
    res.render('categoryDetail', { id: req.params.id });
  }
});
