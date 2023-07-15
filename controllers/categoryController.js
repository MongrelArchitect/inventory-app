const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types;
const Category = require('../models/category');
const Animal = require('../models/animal');

// display all categories
exports.categoryList = asyncHandler(async (req, res, next) => {
  await Category.updateAnimalCount();
  const allCategories = await Category.find({}, 'animalCount name');
  res.render('categoryList', {
    categories: allCategories,
    title: 'Categories',
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
  if (ObjectId.isValid(req.params.id)) {
    // our id parameter looks like a legit mongodb _id
    const category = await Category.findById(req.params.id);
    // check if our id parameter matches a legit category
    if (category) {
      res.render('categoryForm', {
        category,
        editing: true,
        title: 'Edit Category',
      });
    } else {
      // looked like a good _id but not in our database
      res.render('categoryForm', { id: req.params.id });
    }
  } else {
    // not a valid mongodb _id
    res.render('categoryForm', { id: req.params.id });
  }
});

// GET delete category
exports.getDeleteCategory = asyncHandler(async (req, res, next) => {
  if (ObjectId.isValid(req.params.id)) {
    // id parameter looks like a legit mongodb _id
    const category = await Category.findById(req.params.id, 'name');
    if (category) {
      // _id is in our database, so get all its animals & render form
      const animals = await Animal.find({ category: req.params.id });
      res.render('categoryDelete', { animals, category });
    }
  } else {
    // not a legit mongodb _id
    res.render('categoryDelete', { id: req.params.id });
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

// POST delete category
exports.postDeleteCategory = [
  body('id', 'Invalid category id')
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
      res.render('categoryDelete', { id: req.body.id });
    } else {
      // _id is legit, make sure the category actually exists
      const categoryToDelete = await Category.findById(req.body.id);
      if (categoryToDelete) {
        // it's in our database, now make sure it has no animals
        const animals = await Animal.find({ category: req.body.id });
        if (animals.length) {
          // still has animals - rerender the form accordingly
          res.render('categoryDelete', { animals, categoryToDelete });
        } else {
          // no animals in our category, so try to delete it
          const deletedCategory = await Category.findByIdAndDelete(req.body.id);
          if (deletedCategory) {
            // success! redirect to the category list
            res.redirect('/categories');
          } else {
            // something went wrong with deleting...rerender the page
            res.render('categoryDelete', { id: req.body.id });
          }
        }
      } else {
        // the _id looks legit but is not in our database
        res.render('categoryDelete', { id: req.body.id });
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
