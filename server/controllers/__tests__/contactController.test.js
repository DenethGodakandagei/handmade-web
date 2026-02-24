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

jest.unstable_mockModule('../../services/contactService.js', () => ({
    createContact: jest.fn(),
    getAllContacts: jest.fn(),
}));

const { submitContact, getContacts } = await import('../contactController.js');
const contactService = await import('../../services/contactService.js');
const responseUtils = await import('../../utils/responseUtils.js');

describe('contactController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('submitContact', () => {
        it('should create a contact and send success response', async () => {
            req.body = { name: 'Test', email: 'test@test.com', message: 'Hello' };
            const createdContact = { _id: '1', ...req.body };
            contactService.createContact.mockResolvedValue(createdContact);

            await submitContact(req, res, next);

            expect(contactService.createContact).toHaveBeenCalledWith(req.body);
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'Message sent successfully', createdContact);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Database Error');
            contactService.createContact.mockRejectedValue(error);

            await submitContact(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getContacts', () => {
        it('should get all contacts and send success response', async () => {
            const contacts = [{ id: 1 }];
            contactService.getAllContacts.mockResolvedValue(contacts);

            await getContacts(req, res, next);

            expect(contactService.getAllContacts).toHaveBeenCalled();
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All messages', contacts);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('Database Error');
            contactService.getAllContacts.mockRejectedValue(error);

            await getContacts(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
