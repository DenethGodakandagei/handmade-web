import { ErrorResponse } from '../utils/responseUtils.js';
import * as productService from '../services/productService.js';
import path from 'path';
import fs from 'fs';
import ResponseHandler from '../utils/ResponseHandler.js';
import { set as setCache, flush as flushCache } from '../utils/cacheService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const { products, pagination, count } = await productService.getAllProducts(req.query);

  if (req.cacheKey) {
    setCache(req.cacheKey, products, 60);
  }

  ResponseHandler.success(res, 200, 'Products fetched successfully', {
    products,
    pagination,
    count
  });
});

// @desc      Get single product
// @route     GET /api/v1/products/:id
// @access    Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    ResponseHandler.success(res, 200, 'Product details', product);
  } catch (err) {
    next(err);
  }
};

// @desc      Create new product
// @route     POST /api/v1/products
// @access    Private (Artisan/Admin)
export const createProduct = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.artisan = req.user.id;

    // If the user is not an admin, they can only create products if their role is artisan
    if (req.user.role !== 'artisan' && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} is not authorized to create a product`,
          403
        )
      );
    }

    // Handle file uploads if present
    if (req.files) {
      if (req.files.images) {
        req.body.images = req.files.images.map(file => file.path);
      }
      if (req.files.video) {
        req.body.video = req.files.video[0].path;
      }
      if (req.files.video) {
        req.body.video = req.files.video[0].path;
      }
    }

    // Parse JSON fields from FormData
    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (e) {
        return next(new ErrorResponse('Invalid location format', 400));
      }
    }

    if (typeof req.body.customizationOptions === 'string') {
      try {
        req.body.customizationOptions = JSON.parse(req.body.customizationOptions);
      } catch (e) {
        return next(new ErrorResponse('Invalid customization options format', 400));
      }
    }

    const product = await productService.createProduct(req.body);

    // Invalidate product cache so lists show updated data immediately
    flushCache();

    ResponseHandler.success(res, 201, 'Product created', product);
  } catch (err) {
    next(err);
  }
};

// @desc      Update product
// @route     PUT /api/v1/products/:id
// @access    Private (Artisan/Admin)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await productService.getProductById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // specific ownership check
    const artisanId = product.artisan._id ? product.artisan._id.toString() : product.artisan.toString();
    if (artisanId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this product`,
          403
        )
      );
    }

    // Handle file updates similar to create
    if (req.files) {
      if (req.files.images) {
        req.body.images = req.files.images.map(file => file.path);
      }
      if (req.files.video) {
        req.body.video = req.files.video[0].path;
      }
      if (req.files.video) {
        req.body.video = req.files.video[0].path;
      }
    }

    // Parse JSON fields from FormData
    if (typeof req.body.location === 'string') {
      try {
        req.body.location = JSON.parse(req.body.location);
      } catch (e) {
        return next(new ErrorResponse('Invalid location format', 400));
      }
    }

    if (typeof req.body.customizationOptions === 'string') {
      try {
        req.body.customizationOptions = JSON.parse(req.body.customizationOptions);
      } catch (e) {
        return next(new ErrorResponse('Invalid customization options format', 400));
      }
    }

    product = await productService.updateProduct(req.params.id, req.body);

    // Invalidate product cache so lists show updated data immediately
    flushCache();

    ResponseHandler.success(res, 200, 'Product updated', product);
  } catch (err) {
    next(err);
  }
};

// @desc      Delete product
// @route     DELETE /api/v1/products/:id
// @access    Private (Artisan/Admin)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is product owner
    const artisanId = product.artisan._id ? product.artisan._id.toString() : product.artisan.toString();
    if (artisanId !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this product`,
          403
        )
      );
    }

    await productService.deleteProduct(req.params.id);

    // Invalidate product cache so lists show updated data immediately
    flushCache();

    ResponseHandler.success(res, 200, 'Product deleted', {});
  } catch (err) {
    next(err);
  }
};
