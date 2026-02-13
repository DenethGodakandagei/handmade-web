import Contact from '../models/ContactModel.js';

export const createContact = async (contactData) => {
  return await Contact.create(contactData);
};

export const getAllContacts = async () => {
  return await Contact.find().sort('-createdAt');
};
