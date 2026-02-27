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

jest.unstable_mockModule('../../services/faqService.js', () => ({
    getPublishedFaqs: jest.fn(),
    getAllFaqs: jest.fn(),
    getFaqById: jest.fn(),
    createFaq: jest.fn(),
    updateFaq: jest.fn(),
    deleteFaq: jest.fn(),
}));

const {
    getPublishedFaqs,
    getAllFaqs,
    getFaq,
    createFaq,
    updateFaq,
    deleteFaq,
} = await import('../faqController.js');
const faqService = await import('../../services/faqService.js');
const responseUtils = await import('../../utils/responseUtils.js');

describe('faqController', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, user: { id: 'admin123' } };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    // ─── getPublishedFaqs ────────────────────────────────────────────────────
    describe('getPublishedFaqs', () => {
        it('should return all published FAQs with success response', async () => {
            const faqs = [{ _id: '1', question: 'Q1', answer: 'A1', published: true }];
            faqService.getPublishedFaqs.mockResolvedValue(faqs);

            await getPublishedFaqs(req, res, next);

            expect(faqService.getPublishedFaqs).toHaveBeenCalled();
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'Published FAQs', { faqs });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('DB error');
            faqService.getPublishedFaqs.mockRejectedValue(error);

            await getPublishedFaqs(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─── getAllFaqs ──────────────────────────────────────────────────────────
    describe('getAllFaqs', () => {
        it('should return all FAQs with success response', async () => {
            const faqs = [{ _id: '1' }, { _id: '2' }];
            faqService.getAllFaqs.mockResolvedValue(faqs);

            await getAllFaqs(req, res, next);

            expect(faqService.getAllFaqs).toHaveBeenCalled();
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'All FAQs', { faqs });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error if service throws', async () => {
            const error = new Error('DB error');
            faqService.getAllFaqs.mockRejectedValue(error);

            await getAllFaqs(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─── getFaq ─────────────────────────────────────────────────────────────
    describe('getFaq', () => {
        it('should return a single FAQ when found', async () => {
            req.params.id = 'faq1';
            const faq = { _id: 'faq1', question: 'Q?', answer: 'A.' };
            faqService.getFaqById.mockResolvedValue(faq);

            await getFaq(req, res, next);

            expect(faqService.getFaqById).toHaveBeenCalledWith('faq1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'FAQ found', { faq });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with 404 ErrorResponse if FAQ not found', async () => {
            req.params.id = 'missing';
            faqService.getFaqById.mockResolvedValue(null);

            await getFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('FAQ not found with id of missing');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('should call next with error if service throws', async () => {
            req.params.id = 'faq1';
            const error = new Error('DB error');
            faqService.getFaqById.mockRejectedValue(error);

            await getFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─── createFaq ──────────────────────────────────────────────────────────
    describe('createFaq', () => {
        it('should create a published FAQ and send 201 response', async () => {
            req.body = { question: 'How?', answer: 'Like this.', published: true };
            const created = { _id: 'faq1', ...req.body, status: 'published' };
            faqService.createFaq.mockResolvedValue(created);

            await createFaq(req, res, next);

            expect(faqService.createFaq).toHaveBeenCalledWith({
                question: 'How?',
                answer: 'Like this.',
                published: true,
                status: 'published',
                requiresReview: false,
                createdBy: 'admin123',
            });
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 201, 'FAQ created', { faq: created });
            expect(next).not.toHaveBeenCalled();
        });

        it('should create a draft FAQ with requiresReview = true when not published', async () => {
            req.body = { question: 'How?', answer: 'Like this.', published: false };
            const created = { _id: 'faq2', ...req.body, status: 'draft' };
            faqService.createFaq.mockResolvedValue(created);

            await createFaq(req, res, next);

            expect(faqService.createFaq).toHaveBeenCalledWith(
                expect.objectContaining({
                    published: false,
                    status: 'draft',
                    requiresReview: true,
                })
            );
        });

        it('should call next with error if service throws', async () => {
            req.body = { question: 'Q', answer: 'A', published: false };
            const error = new Error('DB error');
            faqService.createFaq.mockRejectedValue(error);

            await createFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─── updateFaq ──────────────────────────────────────────────────────────
    describe('updateFaq', () => {
        it('should update a FAQ and return success response', async () => {
            req.params.id = 'faq1';
            req.body = { question: 'Updated Q?', answer: 'Updated A.', published: true };
            const existing = { _id: 'faq1', question: 'Old Q?', answer: 'Old A.', status: 'draft' };
            const updated = { _id: 'faq1', ...req.body, status: 'published' };

            faqService.getFaqById.mockResolvedValue(existing);
            faqService.updateFaq.mockResolvedValue(updated);

            await updateFaq(req, res, next);

            expect(faqService.getFaqById).toHaveBeenCalledWith('faq1');
            expect(faqService.updateFaq).toHaveBeenCalledWith(
                'faq1',
                expect.objectContaining({ status: 'published' })
            );
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'FAQ updated', { faq: updated });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with 404 if FAQ does not exist before update', async () => {
            req.params.id = 'missing';
            req.body = { question: 'Q', answer: 'A' };
            faqService.getFaqById.mockResolvedValue(null);

            await updateFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('should call next with 404 if updateFaq returns null', async () => {
            req.params.id = 'faq1';
            req.body = { question: 'Q', answer: 'A' };
            const existing = { _id: 'faq1', question: 'Old Q', answer: 'Old A', status: 'draft' };
            faqService.getFaqById.mockResolvedValue(existing);
            faqService.updateFaq.mockResolvedValue(null);

            await updateFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('should call next with error if service throws', async () => {
            req.params.id = 'faq1';
            req.body = { question: 'Q', answer: 'A' };
            const error = new Error('DB error');
            faqService.getFaqById.mockRejectedValue(error);

            await updateFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    // ─── deleteFaq ──────────────────────────────────────────────────────────
    describe('deleteFaq', () => {
        it('should delete a FAQ and return success response', async () => {
            req.params.id = 'faq1';
            const deleted = { _id: 'faq1', question: 'Q?' };
            faqService.deleteFaq.mockResolvedValue(deleted);

            await deleteFaq(req, res, next);

            expect(faqService.deleteFaq).toHaveBeenCalledWith('faq1');
            expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, 200, 'FAQ deleted', {});
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with 404 if FAQ not found on delete', async () => {
            req.params.id = 'missing';
            faqService.deleteFaq.mockResolvedValue(null);

            await deleteFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(responseUtils.ErrorResponse));
            expect(next.mock.calls[0][0].message).toBe('FAQ not found with id of missing');
            expect(next.mock.calls[0][0].statusCode).toBe(404);
        });

        it('should call next with error if service throws', async () => {
            req.params.id = 'faq1';
            const error = new Error('DB error');
            faqService.deleteFaq.mockRejectedValue(error);

            await deleteFaq(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
