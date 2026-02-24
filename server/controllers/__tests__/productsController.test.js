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

jest.unstable_mockModule('../../utils/ResponseHandler.js', () => ({
    default: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.unstable_mockModule('../../services/productService.js', () => ({
    getAllProducts: jest.fn(),
    getProductById: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
}));

jest.unstable_mockModule('../../utils/cacheService.js', () => ({
    set: jest.fn(),
}));

const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = await import('../productsController.js');
const productService = await import('../../services/productService.js');
const responseUtils = await import('../../utils/responseUtils.js');
const ResponseHandler = (await import('../../utils/ResponseHandler.js')).default;

describe('productsController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, user: {}, query: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should get all products and send success response', async () => {
            const result = { products: [{ id: 1 }], pagination: {}, count: 1 };
            productService.getAllProducts.mockResolvedValue(result);

            // We call the inner function mapped via asyncHandler in the actual app
            await getProducts(req, res, next);

            expect(productService.getAllProducts).toHaveBeenCalledWith({});
            expect(ResponseHandler.success).toHaveBeenCalledWith(res, 200, 'Products fetched successfully', result);
        });

        it('should set cache if cacheKey is present', async () => {
            req.cacheKey = 'products_key';
            const result = { products: [{ id: 1 }], pagination: {}, count: 1 };
            productService.getAllProducts.mockResolvedValue(result);

            const cacheService = await import('../../utils/cacheService.js');

            await getProducts(req, res, next);

            expect(cacheService.set).toHaveBeenCalledWith('products_key', result.products, 60);
        });
    });

    describe('getProduct', () => {
        it('should get single product and return success', async () => {
            req.params.id = 'p1';
            const product = { id: 'p1' };
            productService.getProductById.mockResolvedValue(product);

            await getProduct(req, res, next);

            expect(productService.getProductById).toHaveBeenCalledWith('p1');
            expect(ResponseHandler.success).toHaveBeenCalledWith(res, 200, 'Product details', product);
        });

        it('should return 404 error if product not found', async () => {
            req.params.id = 'p1';
            productService.getProductById.mockResolvedValue(null);

            await getProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Product not found with id of p1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

    });

    describe('createProduct', () => {
        it('should create product if user is artisan', async () => {
            req.user = { id: 'u1', role: 'artisan' };
            req.body = { name: 'Mug', location: '{"lat":1}', customizationOptions: '{"color":"red"}' };

            const createdProduct = { id: 'p1', name: 'Mug' };
            productService.createProduct.mockResolvedValue(createdProduct);

            await createProduct(req, res, next);

            expect(req.body.location).toEqual({ lat: 1 });
            expect(req.body.customizationOptions).toEqual({ color: 'red' });
            expect(productService.createProduct).toHaveBeenCalledWith(expect.objectContaining({ artisan: 'u1', name: 'Mug' }));
            expect(ResponseHandler.success).toHaveBeenCalledWith(res, 201, 'Product created', createdProduct);
        });

        it('should return error if not authorized', async () => {
            req.user = { id: 'u1', role: 'user' };

            await createProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('The user with ID u1 is not authorized to create a product');
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });
    });

    describe('updateProduct', () => {
        it('should update product if authorized (owner)', async () => {
            req.params.id = 'p1';
            req.user = { id: 'u1', role: 'artisan' };
            req.body = { name: 'Updated Mug' };

            const product = { id: 'p1', artisan: { _id: { toString: () => 'u1' } } };
            productService.getProductById.mockResolvedValue(product);

            const updatedProduct = { ...product, name: 'Updated Mug' };
            productService.updateProduct.mockResolvedValue(updatedProduct);

            await updateProduct(req, res, next);

            expect(productService.updateProduct).toHaveBeenCalledWith('p1', req.body);
            expect(ResponseHandler.success).toHaveBeenCalledWith(res, 200, 'Product updated', updatedProduct);
        });

        it('should return error if not authorized to update', async () => {
            req.params.id = 'p1';
            req.user = { id: 'u2', role: 'artisan' };

            const product = { id: 'p1', artisan: { _id: { toString: () => 'u1' } } };
            productService.getProductById.mockResolvedValue(product);

            await updateProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('User u2 is not authorized to update this product');
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });
    });

    describe('deleteProduct', () => {
        it('should delete product if authorized', async () => {
            req.params.id = 'p1';
            req.user = { id: 'adminId', role: 'admin' };

            const product = { id: 'p1', artisan: { _id: { toString: () => 'u1' } } };
            productService.getProductById.mockResolvedValue(product);
            productService.deleteProduct.mockResolvedValue();

            await deleteProduct(req, res, next);

            expect(productService.deleteProduct).toHaveBeenCalledWith('p1');
            expect(ResponseHandler.success).toHaveBeenCalledWith(res, 200, 'Product deleted', {});
        });
    });
});
