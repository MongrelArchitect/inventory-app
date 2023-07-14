const express = require('express');

const categoryController = require('../controllers/categoryController');

const router = express.Router();

// list all categories
router.get('/', categoryController.categoryList);

// new category form GET
router.get('/new', categoryController.getNewCategoryForm);

// new category form POST
router.post('/new', categoryController.postNewCategoryForm);

// individual category detail
router.get('/:id', categoryController.categoryDetail);

module.exports = router;
