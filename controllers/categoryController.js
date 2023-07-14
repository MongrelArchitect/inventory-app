const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
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

// show new category form
exports.getNewCategoryForm = (req, res, next) => {
  res.render('categoryForm', { title: 'New Category' });
};

// post request to new category form
exports.postNewCategoryForm = [
  // validate & sanitize user input
  body('name', 'Name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('description').optional().trim().escape(),

  // process request after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // create an animal object with escaped and trimmed data
    const category = new Category({
      description: req.body.description,
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      // got some errors - render the form again with sanitized data
      res.render('categoryForm', {
        category,
        errors: errors.mapped(),
        title: 'New Category',
      });
    } else {
      // form data is valid

      // check if the category is already in our database
      const categoryExists = await Category
        .findOne({ name: req.body.name })
        // we have a case-insensitive index in our database
        .collation({ locale: 'en', strength: 1 });
      if (categoryExists) {
        // already in our inventory, redirect to its detail page
        res.redirect(categoryExists.url);
      } else {
        // save our new category and redirect to its detail page
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];
