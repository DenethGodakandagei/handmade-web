import Faq from '../models/faqModel.js';

export const getPublishedFaqs = async () => {
  return await Faq.find({ published: true }).sort({ createdAt: -1 });
};

export const getAllFaqs = async () => {
  return await Faq.find().sort({ createdAt: -1 });
};

export const getFaqById = async (id) => {
  return await Faq.findById(id);
};

export const createFaq = async (faqData) => {
  return await Faq.create(faqData);
};

export const updateFaq = async (id, faqData) => {
  return await Faq.findByIdAndUpdate(id, faqData, {
    new: true,
    runValidators: true
  });
};

export const deleteFaq = async (id) => {
  return await Faq.findByIdAndDelete(id);
};
