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

jest.unstable_mockModule('../../services/customizationRequestService.js', () => ({
    createRequest: jest.fn(),
    getRequestsByArtisan: jest.fn(),
    getRequestsByBuyer: jest.fn(),
    getRequestById: jest.fn(),
    updateRequestStatus: jest.fn(),
}));

jest.unstable_mockModule('../../models/ProductModel.js', () => ({
    default: {
        findById: jest.fn(),
    },
}));

const { createCustomizationRequest, getMyCustomizationRequests, updateCustomizationStatus } = await import('../customizationRequestController.js');
const customizationService = await import('../../services/customizationRequestService.js');
const responseUtils = await import('../../utils/responseUtils.js');
const Product = (await import('../../models/ProductModel.js')).default;

describe('customizationRequestController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, user: {}, file: undefined };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('createCustomizationRequest', () => {
        it('should create request and send success response', async () => {
            req.user = { id: 'buyerId' };
            req.body = { product: 'p1', customizations: { color: 'red' }, customMessage: 'Please' };

            const product = { _id: 'p1', artisan: 'artisanId' };
            Product.findById.mockResolvedValue(product);

            const requestData = {
                buyer: 'buyerId',
                artisan: 'artisanId',
                product: 'p1',
                customizations: { color: 'red' },
                notes: 'Please',
                designImage: null
            };

            const newRequest = { id: 1, ...requestData };
            customizationService.createRequest.mockResolvedValue(newRequest);

            await createCustomizationRequest(req, res, next);

            expect(Product.findById).toHaveBeenCalledWith('p1');
            expect(customizationService.createRequest).toHaveBeenCalledWith(requestData);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'Customization request sent to artisan', newRequest);
        });

        it('should return error if product not found', async () => {
            req.body = { product: 'p1' };
            Product.findById.mockResolvedValue(null);

            await createCustomizationRequest(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Product not found with id p1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('getMyCustomizationRequests', () => {
        it('should get artisan requests', async () => {
            req.user = { id: 'artisanId', role: 'artisan' };
            const requests = [{ id: 1 }];
            customizationService.getRequestsByArtisan.mockResolvedValue(requests);

            await getMyCustomizationRequests(req, res, next);

            expect(customizationService.getRequestsByArtisan).toHaveBeenCalledWith('artisanId');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Fetched customization requests', requests);
        });

        it('should get buyer requests', async () => {
            req.user = { id: 'buyerId', role: 'user' };
            const requests = [{ id: 1 }];
            customizationService.getRequestsByBuyer.mockResolvedValue(requests);

            await getMyCustomizationRequests(req, res, next);

            expect(customizationService.getRequestsByBuyer).toHaveBeenCalledWith('buyerId');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Fetched customization requests', requests);
        });
    });

    describe('updateCustomizationStatus', () => {
        it('should update status if authorized (artisan)', async () => {
            req.params.id = 'r1';
            req.user = { id: 'artisanId', role: 'artisan' };
            req.body = { status: 'Accepted', price: 100 };

            const request = { _id: 'r1', artisan: { _id: { toString: () => 'artisanId' } } };
            customizationService.getRequestById.mockResolvedValue(request);

            const updatedRequest = { ...request, status: 'Accepted', price: 100 };
            customizationService.updateRequestStatus.mockResolvedValue(updatedRequest);

            await updateCustomizationStatus(req, res, next);

            expect(customizationService.updateRequestStatus).toHaveBeenCalledWith('r1', { status: 'Accepted', price: 100 });
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Status updated', updatedRequest);
        });

        it('should update status if authorized (admin)', async () => {
            req.params.id = 'r1';
            req.user = { id: 'adminId', role: 'admin' };
            req.body = { status: 'Accepted' };

            const request = { _id: 'r1', artisan: { _id: { toString: () => 'artisanId' } } };
            customizationService.getRequestById.mockResolvedValue(request);

            const updatedRequest = { ...request, status: 'Accepted' };
            customizationService.updateRequestStatus.mockResolvedValue(updatedRequest);

            await updateCustomizationStatus(req, res, next);

            expect(customizationService.updateRequestStatus).toHaveBeenCalledWith('r1', { status: 'Accepted' });
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Status updated', updatedRequest);
        });

        it('should return error if not authorized', async () => {
            req.params.id = 'r1';
            req.user = { id: 'otherId', role: 'artisan' };
            req.body = { status: 'Accepted' };

            const request = { _id: 'r1', artisan: { _id: { toString: () => 'artisanId' } } };
            customizationService.getRequestById.mockResolvedValue(request);

            await updateCustomizationStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Not authorized to update this request');
            expect(next.mock.calls[0][0].statusCode).toBe(403);
        });

        it('should return error if request not found', async () => {
            req.params.id = 'r1';
            customizationService.getRequestById.mockResolvedValue(null);

            await updateCustomizationStatus(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Request not found with id r1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });
});
