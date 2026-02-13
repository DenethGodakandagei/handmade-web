import Review from '../models/ReviewModel.js';

export const getReviews = async (query) => {
    return await Review.find(query).populate({
        path: 'product',
        select: 'name'
    });
}

export const getReviewById = async (id) => {
    return await Review.findById(id).populate({
        path: 'product',
        select: 'name'
    });
}

export const createReview = async (reviewData) => {
    return await Review.create(reviewData);
}

export const updateReview = async (id, reviewData) => {
    return await Review.findByIdAndUpdate(id, reviewData, {
        new: true,
        runValidators: true
    });
}

export const deleteReview = async (review) => {
    return await review.deleteOne(); // Using document method to trigger hooks
}
