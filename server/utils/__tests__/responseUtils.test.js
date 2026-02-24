import { jest } from '@jest/globals';
import { sendSuccess, ErrorResponse } from '../responseUtils.js';

describe('responseUtils', () => {
    let mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendSuccess', () => {
        it('should send a success response without data', () => {
            sendSuccess(mockRes, 200, 'Success Message');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Success Message'
            });
        });

        it('should send a success response with data', () => {
            const data = { id: 1, name: 'Item' };
            sendSuccess(mockRes, 201, 'Created Successfully', data);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'Created Successfully',
                data
            });
        });
    });

    describe('ErrorResponse', () => {
        it('should create an instance of ErrorResponse with correct properties', () => {
            const errorMessage = 'Not Found';
            const statusCode = 404;

            const error = new ErrorResponse(errorMessage, statusCode);

            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe(errorMessage);
            expect(error.statusCode).toBe(statusCode);
            expect(error.success).toBe(false);
        });
    });
});
