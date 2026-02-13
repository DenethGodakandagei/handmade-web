import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as reviewService from '../services/reviewService.js';
import Product from '../models/ProductModel.js';

// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/products/:productId/reviews
// @access    Public
export const getReviews = async (req, res, next) => {
  try {
    if (req.params.productId) {
      const reviews = await reviewService.getReviews({ product: req.params.productId });
      return sendSuccess(res, 200, 'Reviews for product', reviews);
    } else {
      const reviews = await reviewService.getReviews({});
      return sendSuccess(res, 200, 'All reviews', reviews);
    }
  } catch (err) {
    next(err);
  }
};

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
export const getReview = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    if (!review) {
      return next(
        new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'Review found', review);
  } catch (err) {
    next(err);
  }
};

// @desc      Add review
// @route     POST /api/v1/products/:productId/reviews
// @access    Private (Buyer)
export const addReview = async (req, res, next) => {
  try {
    req.body.product = req.params.productId || req.body.product;
    req.body.user = req.user.id;

    const product = await Product.findById(req.body.product);

    if (!product) {
      return next(
        new ErrorResponse(`No product with the id of ${req.body.product}`, 404)
      );
    }

    const review = await reviewService.createReview(req.body);

    sendSuccess(res, 201, 'Review added', review);
  } catch (err) {
    next(err);
  }
};

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
export const updateReview = async (req, res, next) => {
  try {
    let review = await reviewService.getReviewById(req.params.id);

    if (!review) {
      return next(
        new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
      );
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update review`, 401));
    }

    review = await reviewService.updateReview(req.params.id, req.body);

    sendSuccess(res, 200, 'Review updated', review);
  } catch (err) {
    next(err);
  }
};

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    if (!review) {
      return next(
        new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
      );
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to delete review`, 401));
    }

    await reviewService.deleteReview(review);

    sendSuccess(res, 200, 'Review deleted', {});
  } catch (err) {
    next(err);
  }
};
