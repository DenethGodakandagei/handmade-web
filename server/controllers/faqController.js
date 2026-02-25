import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as faqService from '../services/faqService.js';

// @desc      Get published FAQs
// @route     GET /api/v1/faqs
// @access    Public
export const getPublishedFaqs = async (req, res, next) => {
  try {
    const faqs = await faqService.getPublishedFaqs();
    sendSuccess(res, 200, 'Published FAQs', { faqs });
  } catch (err) {
    next(err);
  }
};

// @desc      Get all FAQs
// @route     GET /api/v1/faqs/admin
// @access    Private/Admin
export const getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await faqService.getAllFaqs();
    sendSuccess(res, 200, 'All FAQs', { faqs });
  } catch (err) {
    next(err);
  }
};

// @desc      Get single FAQ
// @route     GET /api/v1/faqs/:id
// @access    Private/Admin
export const getFaq = async (req, res, next) => {
  try {
    const faq = await faqService.getFaqById(req.params.id);

    if (!faq) {
      return next(
        new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'FAQ found', { faq });
  } catch (err) {
    next(err);
  }
};

// @desc      Create FAQ
// @route     POST /api/v1/faqs
// @access    Private/Admin
export const createFaq = async (req, res, next) => {
  try {
    const { question, answer, published, status } = req.body;
    const isPublished = Boolean(published);
    const normalizedStatus = isPublished ? 'published' : (status || 'draft');
    const faq = await faqService.createFaq({
      question,
      answer,
      published: isPublished,
      status: normalizedStatus,
      requiresReview: !isPublished,
      createdBy: req.user.id
    });

    sendSuccess(res, 201, 'FAQ created', { faq });
  } catch (err) {
    next(err);
  }
};

// @desc      Update FAQ
// @route     PUT /api/v1/faqs/:id
// @access    Private/Admin
export const updateFaq = async (req, res, next) => {
  try {
    const { question, answer, published, status } = req.body;
    const existing = await faqService.getFaqById(req.params.id);

    if (!existing) {
      return next(
        new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
      );
    }

    const hasQuestionUpdate =
      typeof question === 'string' && question.trim() !== existing.question;
    const hasAnswerUpdate =
      typeof answer === 'string' && answer.trim() !== existing.answer;
    const hasContentUpdate = hasQuestionUpdate || hasAnswerUpdate;

    let requiresReview = false;
    let nextStatus = existing.status || 'draft';
    if (published === true) {
      nextStatus = 'published';
    } else if (typeof status === 'string') {
      nextStatus = status;
    }

    const faq = await faqService.updateFaq(req.params.id, {
      question,
      answer,
      published,
      status: nextStatus,
      requiresReview
    });

    if (!faq) {
      return next(
        new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'FAQ updated', { faq });
  } catch (err) {
    next(err);
  }
};

// @desc      Delete FAQ
// @route     DELETE /api/v1/faqs/:id
// @access    Private/Admin
export const deleteFaq = async (req, res, next) => {
  try {
    const faq = await faqService.deleteFaq(req.params.id);

    if (!faq) {
      return next(
        new ErrorResponse(`FAQ not found with id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'FAQ deleted', {});
  } catch (err) {
    next(err);
  }
};
