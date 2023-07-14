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

// delete category detail GET
router.get('/:id/delete', categoryController.getDeleteCategory);

// delete category detail POST
router.post('/:id/delete', categoryController.postDeleteCategory);

// edit category detail GET
router.get('/:id/edit', categoryController.getCategoryEdit);

// edit category detail GET
router.post('/:id/edit', categoryController.postCategoryEdit);

module.exports = router;
