import Review from '../models/ReviewModel.js';

export const getReviews = async (query) => {
    return await Review.find(query)
        .populate({ path: 'product', select: 'name images' })
        .populate({ path: 'user', select: 'name email' })
        .sort('-createdAt');
}

export const getReviewById = async (id) => {
    return await Review.findById(id)
        .populate({ path: 'product', select: 'name images' })
        .populate({ path: 'user', select: 'name email' });
}

export const createReview = async (reviewData) => {
    const review = await Review.create(reviewData);
    return await Review.findById(review._id)
        .populate({ path: 'product', select: 'name images' })
        .populate({ path: 'user', select: 'name email' });
}

export const updateReview = async (id, reviewData) => {
    return await Review.findByIdAndUpdate(id, reviewData, {
        new: true,
        runValidators: true
    })
        .populate({ path: 'product', select: 'name images' })
        .populate({ path: 'user', select: 'name email' });
}

export const deleteReview = async (review) => {
    return await review.deleteOne(); // Using document method to trigger hooks
}

export const getReviewCount = async () => {
    return await Review.countDocuments();
}
