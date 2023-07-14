const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
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

// GET category edit form
exports.getCategoryEdit = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.render('categoryForm', {
      category,
      editing: true,
      title: 'Edit Category',
    });
  } else {
    res.render('categoryForm', { id: req.params.id });
  }
});

// show new category form
exports.getNewCategoryForm = (req, res, next) => {
  res.render('categoryForm', { title: 'New Category' });
};

// POST category edit form
exports.postCategoryEdit = [
  // validate & sanitize user input
  param('id', 'Invalid cateogry id')
    .trim()
    .escape()
    .custom((value) => {
      // make sure it's a valid mongodb _id
      if (ObjectId.isValid(value)) {
        return true;
      }
      return false;
    }),
  body('name', 'Name must contain at least 2 characters')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('description').optional().trim().escape(),

  // process request after validation
  asyncHandler(async (req, res, next) => {
    // extract any errors
    const errors = validationResult(req);

    // create a category object with escaped and trimmed data
    const category = new Category({
      _id: req.params.id,
      description: req.body.description,
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      // got some errors - render the form again with sanitized data
      res.render('categoryForm', {
        category,
        errors: errors.mapped(),
        title: 'Edit Category',
      });
    } else {
      // form data is valid

      // make sure the id parameter matches a category in our database
      const checkCategory = await Category.findById(category._id);
      if (checkCategory) {
        // save our new category and redirect to its detail page
        const newCategory = await Category.findByIdAndUpdate(
          category._id,
          category,
        );
        res.redirect(newCategory.url);
      } else {
        // category id parameter looked legit but isn't in our datagbase
        res.render('categoryForm', {
          category,
          errors: { id: { msg: 'Invalid category id' } },
          title: 'Edit Category',
        });
      }
    }
  }),
];

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

    // create a category object with escaped and trimmed data
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
      const categoryExists = await Category.findOne({ name: req.body.name })
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
