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

jest.unstable_mockModule('../../services/authService.js', () => ({
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    getUserById: jest.fn(),
    updateUserDetails: jest.fn(),
    updateUserPassword: jest.fn(),
    becomeSeller: jest.fn(),
}));

jest.unstable_mockModule('../../models/FailedLoginModel.js', () => ({
    default: {
        create: jest.fn().mockResolvedValue(),
        countDocuments: jest.fn().mockResolvedValue(0),
    },
}));

jest.unstable_mockModule('../../models/ActiveSessionModel.js', () => ({
    default: {
        deleteOne: jest.fn().mockResolvedValue(),
        findOneAndUpdate: jest.fn().mockResolvedValue(),
    },
}));

jest.unstable_mockModule('../../models/BlacklistedIPModel.js', () => ({
    default: {
        findOne: jest.fn().mockResolvedValue(),
        create: jest.fn().mockResolvedValue(),
    },
}));

const { register, login, getMe, logout, updateDetails, updatePassword, becomeSeller } = await import('../authController.js');
const authService = await import('../../services/authService.js');
const responseUtils = await import('../../utils/responseUtils.js');

describe('authController', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            user: {},
            headers: { 'user-agent': 'Jest' },
            socket: { remoteAddress: '127.0.0.1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();

        // mock global process.env
        process.env.JWT_COOKIE_EXPIRE = '30';
    });

    describe('register', () => {
        it('should register a user, set cookie, and send success', async () => {
            req.body = { email: 'test@test.com', password: 'password123', role: 'user' };

            const user = { getSignedJwtToken: jest.fn().mockReturnValue('mock-token'), _id: 'u1' };
            authService.registerUser.mockResolvedValue(user);

            await register(req, res, next);

            expect(authService.registerUser).toHaveBeenCalledWith(req.body);
            expect(user.getSignedJwtToken).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('token', 'mock-token', expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({ success: true, token: 'mock-token' });
        });

        it('should call next if registration fails', async () => {
            const err = new Error('Registration failed');
            authService.registerUser.mockRejectedValue(err);

            await register(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('login', () => {
        it('should login a user, set cookie, and send success', async () => {
            req.body = { email: 'test@test.com', password: 'password123' };

            const user = { getSignedJwtToken: jest.fn().mockReturnValue('mock-token'), _id: 'u1' };
            authService.loginUser.mockResolvedValue(user);

            await login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledWith('test@test.com', 'password123');
            expect(user.getSignedJwtToken).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('token', 'mock-token', expect.any(Object));
        });

        it('should track failed logins and call next', async () => {
            req.body = { email: 'test@test.com', password: 'wrong' };

            const err = new Error('Invalid credentials');
            authService.loginUser.mockRejectedValue(err);

            const FailedLogin = (await import('../../models/FailedLoginModel.js')).default;
            FailedLogin.create.mockResolvedValue();
            FailedLogin.countDocuments.mockResolvedValue(0);

            await login(req, res, next);

            // Wait for the next tick for the catch block microtasks to run
            await new Promise((resolve) => setImmediate(resolve));
            expect(FailedLogin.create).toHaveBeenCalled();

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
            expect(next.mock.calls[0][0].statusCode).toBe(401);
        });

        it('should require email and password', async () => {
            req.body = { email: 'test@test.com' };

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('Please provide an email and password');
            expect(next.mock.calls[0][0].statusCode).toBe(400);
        });
    });

    describe('getMe', () => {
        it('should get current logged in user', async () => {
            req.user = { id: 'u1' };
            const user = { id: 'u1', name: 'Test User' };
            authService.getUserById.mockResolvedValue(user);

            await getMe(req, res, next);

            expect(authService.getUserById).toHaveBeenCalledWith('u1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Current user', user);
        });
    });

    describe('logout', () => {
        it('should clear cookie and respond successfully', async () => {
            req.headers.authorization = 'Bearer mock-token';

            await logout(req, res, next);

            expect(res.cookie).toHaveBeenCalledWith('token', 'none', expect.objectContaining({ httpOnly: true }));
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'User logged out successfully');
        });
    });

    describe('updateDetails', () => {
        it('should update user details', async () => {
            req.user = { id: 'u1' };
            req.body = { name: 'New Name', email: 'new@email.com' };

            const user = { id: 'u1', name: 'New Name', email: 'new@email.com' };
            authService.updateUserDetails.mockResolvedValue(user);

            await updateDetails(req, res, next);

            expect(authService.updateUserDetails).toHaveBeenCalledWith('u1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'User details updated', user);
        });
    });

    describe('updatePassword', () => {
        it('should update user password and set new cookie', async () => {
            req.user = { id: 'u1' };
            req.body = { currentPassword: '123', newPassword: '456' };

            const user = { getSignedJwtToken: jest.fn().mockReturnValue('new-token'), _id: 'u1' };
            authService.updateUserPassword.mockResolvedValue(user);

            await updatePassword(req, res, next);

            expect(authService.updateUserPassword).toHaveBeenCalledWith('u1', '123', '456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.cookie).toHaveBeenCalledWith('token', 'new-token', expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({ success: true, token: 'new-token' });
        });
    });

    describe('becomeSeller', () => {
        it('should submit seller application', async () => {
            req.user = { id: 'u1' };
            req.body = { businessName: 'Crafts' };

            const user = { id: 'u1', isSeller: true };
            authService.becomeSeller.mockResolvedValue(user);

            await becomeSeller(req, res, next);

            expect(authService.becomeSeller).toHaveBeenCalledWith('u1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Seller application submitted', user);
        });
    });
});
