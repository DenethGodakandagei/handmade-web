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

jest.unstable_mockModule('../../services/userService.js', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
}));

const { getUsers, getUser, createUser, updateUser, deleteUser } = await import('../usersController.js');
const userService = await import('../../services/userService.js');
const responseUtils = await import('../../utils/responseUtils.js');

describe('usersController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should get all users and send success response', async () => {
            const users = [{ id: 1 }];
            userService.getAllUsers.mockResolvedValue(users);

            await getUsers(req, res, next);

            expect(userService.getAllUsers).toHaveBeenCalled();
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All users', users);
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('DB Error');
            userService.getAllUsers.mockRejectedValue(error);

            await getUsers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getUser', () => {
        it('should get single user and send success response', async () => {
            req.params.id = '1';
            const user = { id: 1 };
            userService.getUserById.mockResolvedValue(user);

            await getUser(req, res, next);

            expect(userService.getUserById).toHaveBeenCalledWith('1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'User found', user);
        });

        it('should call next with error if user not found', async () => {
            req.params.id = '1';
            userService.getUserById.mockResolvedValue(null);

            await getUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('No user with the id of 1');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });
    });

    describe('createUser', () => {
        it('should create user and send success response', async () => {
            req.body = { name: 'Test' };
            const createdUser = { id: 1, ...req.body };
            userService.createUser.mockResolvedValue(createdUser);

            await createUser(req, res, next);

            expect(userService.createUser).toHaveBeenCalledWith(req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'User created', createdUser);
        });
    });

    describe('updateUser', () => {
        it('should update user and send success response', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated' };
            const updatedUser = { id: 1, ...req.body };
            userService.updateUser.mockResolvedValue(updatedUser);

            await updateUser(req, res, next);

            expect(userService.updateUser).toHaveBeenCalledWith('1', req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'User updated', updatedUser);
        });

        it('should call next with error if user to update is not found', async () => {
            req.params.id = '1';
            userService.updateUser.mockResolvedValue(null);

            await updateUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
        });
    });

    describe('deleteUser', () => {
        it('should delete user and send success response', async () => {
            req.params.id = '1';
            userService.deleteUser.mockResolvedValue({});

            await deleteUser(req, res, next);

            expect(userService.deleteUser).toHaveBeenCalledWith('1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'User deleted', {});
        });
    });
});
