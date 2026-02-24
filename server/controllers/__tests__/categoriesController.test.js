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

jest.unstable_mockModule('../../services/categoryService.js', () => ({
    getAllCategories: jest.fn(),
    getCategoryById: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
}));

const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = await import('../categoriesController.js');
const categoryService = await import('../../services/categoryService.js');
const responseUtils = await import('../../utils/responseUtils.js');

describe('categoriesController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getCategories', () => {
        it('should get all categories and send success response', async () => {
            const categories = [{ id: 1 }];
            categoryService.getAllCategories.mockResolvedValue(categories);

            await getCategories(req, res, next);

            expect(categoryService.getAllCategories).toHaveBeenCalled();
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All categories', categories);
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Database Error');
            categoryService.getAllCategories.mockRejectedValue(error);

            await getCategories(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getCategory', () => {
        it('should get single category and send success response', async () => {
            req.params.id = '1';
            const category = { id: 1 };
            categoryService.getCategoryById.mockResolvedValue(category);

            await getCategory(req, res, next);

            expect(categoryService.getCategoryById).toHaveBeenCalledWith('1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Category found', category);
        });

        it('should call next with error if category not found', async () => {
            req.params.id = '1';
            categoryService.getCategoryById.mockResolvedValue(null);

            await getCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Category not found with id of 1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('createCategory', () => {
        it('should create category and send success response', async () => {
            req.body = { name: 'Test Category' };
            const createdCategory = { id: 1, ...req.body };
            categoryService.createCategory.mockResolvedValue(createdCategory);

            await createCategory(req, res, next);

            expect(categoryService.createCategory).toHaveBeenCalledWith(req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'Category created', createdCategory);
        });
    });

    describe('updateCategory', () => {
        it('should update category and send success response', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Category' };
            const updatedCategory = { id: 1, ...req.body };
            categoryService.updateCategory.mockResolvedValue(updatedCategory);

            await updateCategory(req, res, next);

            expect(categoryService.updateCategory).toHaveBeenCalledWith('1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Category updated', updatedCategory);
        });

        it('should call next with error if category to update is not found', async () => {
            req.params.id = '1';
            categoryService.updateCategory.mockResolvedValue(null);

            await updateCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Category not found with id of 1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('deleteCategory', () => {
        it('should delete category and send success response', async () => {
            req.params.id = '1';
            categoryService.deleteCategory.mockResolvedValue({});

            await deleteCategory(req, res, next);

            expect(categoryService.deleteCategory).toHaveBeenCalledWith('1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Category deleted', {});
        });
    });
});
