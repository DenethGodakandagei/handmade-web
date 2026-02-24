import { jest } from '@jest/globals';
import ResponseHandler from '../ResponseHandler.js';

describe('ResponseHandler', () => {
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

    describe('success', () => {
        it('should return default success response when no arguments are provided', () => {
            ResponseHandler.success(mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 200,
                message: 'Operation successful',
                data: null
            });
        });

        it('should return custom success response when arguments are provided', () => {
            const data = { user: 'test' };
            ResponseHandler.success(mockRes, 201, 'User created', data);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                statusCode: 201,
                message: 'User created',
                data
            });
        });
    });

    describe('error', () => {
        const originalEnv = process.env.NODE_ENV;

        afterAll(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should return default error response', () => {
            process.env.NODE_ENV = 'production';
            ResponseHandler.error(mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                statusCode: 500,
                message: 'An error occurred',
                error: undefined
            });
        });

        it('should include error details in development environment', () => {
            process.env.NODE_ENV = 'development';
            const errorStr = 'Database connection failed';
            ResponseHandler.error(mockRes, 400, 'Bad Request', errorStr);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                statusCode: 400,
                message: 'Bad Request',
                error: errorStr
            });
        });
    });
});
