import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as categoryService from '../services/categoryService.js';

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    sendSuccess(res, 200, 'All categories', categories);
  } catch (err) {
    next(err);
  }
};

// @desc      Get single category
// @route     GET /api/v1/categories/:id
// @access    Public
export const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'Category found', category);
  } catch (err) {
    next(err);
  }
};

// @desc      Create category
// @route     POST /api/v1/categories
// @access    Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess(res, 201, 'Category created', category);
  } catch (err) {
    next(err);
  }
};

// @desc      Update category
// @route     PUT /api/v1/categories/:id
// @access    Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'Category updated', category);
  } catch (err) {
    next(err);
  }
};

// @desc      Delete category
// @route     DELETE /api/v1/categories/:id
// @access    Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    sendSuccess(res, 200, 'Category deleted', {});
  } catch (err) {
    next(err);
  }
};
