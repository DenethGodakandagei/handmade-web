import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as contactService from '../services/contactService.js';

// @desc      Submit contact message
// @route     POST /api/v1/contact
// @access    Public
export const submitContact = async (req, res, next) => {
  try {
    const contact = await contactService.createContact(req.body);
    sendSuccess(res, 201, 'Message sent successfully', contact);
  } catch (err) {
    next(err);
  }
};

// @desc      Get all contact messages
// @route     GET /api/v1/contact
// @access    Private/Admin
export const getContacts = async (req, res, next) => {
  try {
    const contacts = await contactService.getAllContacts();
    sendSuccess(res, 200, 'All messages', contacts);
  } catch (err) {
    next(err);
  }
};
