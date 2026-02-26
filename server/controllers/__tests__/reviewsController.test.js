import { jest } from '@jest/globals';

jest.unstable_mockModule('../../utils/responseUtils.js', () => ({
    sendSuccess: jest.fn(),
    ErrorResponse: class ErrorResponse extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    },
}));

jest.unstable_mockModule('../../services/reviewService.js', () => ({
    getReviews: jest.fn(),
    getReviewById: jest.fn(),
    createReview: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
}));

jest.unstable_mockModule('../../models/ProductModel.js', () => ({
    default: {
        findById: jest.fn(),
    },
}));

const { getReviews, getReview, addReview, updateReview, deleteReview } = await import('../reviewsController.js');
const reviewService = await import('../../services/reviewService.js');
const responseUtils = await import('../../utils/responseUtils.js');
const Product = (await import('../../models/ProductModel.js')).default;

describe('reviewsController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, user: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getReviews', () => {
        it('should get product specific reviews', async () => {
            req.params.productId = '1';
            const reviews = [{ id: 1, text: 'Great' }];
            reviewService.getReviews.mockResolvedValue(reviews);

            await getReviews(req, res, next);

            expect(reviewService.getReviews).toHaveBeenCalledWith({ product: '1' });
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Reviews for product', reviews);
        });

        it('should get all reviews', async () => {
            req.params = {};
            const reviews = [{ id: 1 }, { id: 2 }];
            reviewService.getReviews.mockResolvedValue(reviews);

            await getReviews(req, res, next);

            expect(reviewService.getReviews).toHaveBeenCalledWith({});
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All reviews', reviews);
        });
    });

    describe('getReview', () => {
        it('should get single review', async () => {
            req.params.id = '1';
            const review = { id: 1 };
            reviewService.getReviewById.mockResolvedValue(review);

            await getReview(req, res, next);

            expect(reviewService.getReviewById).toHaveBeenCalledWith('1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Review found', review);
        });

        it('should return error if review not found', async () => {
            req.params.id = '1';
            reviewService.getReviewById.mockResolvedValue(null);

            await getReview(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('No review found with the id of 1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('addReview', () => {
        it('should add review if product exists', async () => {
            req.params.productId = 'p1';
            req.user.id = 'u1';
            req.body = { text: 'Good' };

            const product = { _id: 'p1' };
            Product.findById.mockResolvedValue(product);

            const review = { id: 1, ...req.body, product: 'p1', user: 'u1' };
            reviewService.createReview.mockResolvedValue(review);

            await addReview(req, res, next);

            expect(Product.findById).toHaveBeenCalledWith('p1');
            expect(reviewService.createReview).toHaveBeenCalledWith({ text: 'Good', product: 'p1', user: 'u1' });
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'Review added', review);
        });

        it('should call next with error if product not found', async () => {
            req.params.productId = 'p1';
            req.user.id = 'u1';

            Product.findById.mockResolvedValue(null);

            await addReview(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('No product with the id of p1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('updateReview', () => {
        it('should update review if authorized (owner)', async () => {
            req.params.id = '1';
            req.user = { id: 'u1', role: 'user' };
            req.body = { text: 'Updated' };

            const review = { id: 1, user: { toString: () => 'u1' } };
            reviewService.getReviewById.mockResolvedValue(review);

            const updatedReview = { ...review, text: 'Updated' };
            reviewService.updateReview.mockResolvedValue(updatedReview);

            await updateReview(req, res, next);

            expect(reviewService.updateReview).toHaveBeenCalledWith('1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Review updated', updatedReview);
        });

        it('should update review if authorized (admin)', async () => {
            req.params.id = '1';
            req.user = { id: 'adminId', role: 'admin' };
            req.body = { text: 'Updated' };

            const review = { id: 1, user: { toString: () => 'u1' } };
            reviewService.getReviewById.mockResolvedValue(review);

            const updatedReview = { ...review, text: 'Updated' };
            reviewService.updateReview.mockResolvedValue(updatedReview);

            await updateReview(req, res, next);

            expect(reviewService.updateReview).toHaveBeenCalledWith('1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Review updated', updatedReview);
        });

        it('should return error if not authorized', async () => {
            req.params.id = '1';
            req.user = { id: 'u2', role: 'user' };

            const review = { id: 1, user: { toString: () => 'u1' } };
            reviewService.getReviewById.mockResolvedValue(review);

            await updateReview(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Not authorized to update review');
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should return error if review not found', async () => {
            req.params.id = '1';
            reviewService.getReviewById.mockResolvedValue(null);

            await updateReview(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('deleteReview', () => {
        it('should delete review if authorized', async () => {
            req.params.id = '1';
            req.user = { id: 'u1', role: 'user' };

            const review = { id: 1, user: { toString: () => 'u1' } };
            reviewService.getReviewById.mockResolvedValue(review);
            reviewService.deleteReview.mockResolvedValue({});

            await deleteReview(req, res, next);

            expect(reviewService.deleteReview).toHaveBeenCalledWith(review);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Review deleted', {});
        });

        it('should return error if not authorized', async () => {
            req.params.id = '1';
            req.user = { id: 'u2', role: 'user' };

            const review = { id: 1, user: { toString: () => 'u1' } };
            reviewService.getReviewById.mockResolvedValue(review);

            await deleteReview(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Not authorized to delete review');
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });
    });
});
