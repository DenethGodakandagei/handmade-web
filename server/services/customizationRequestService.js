import CustomizationRequest from '../models/CustomizationRequestModel.js';

export const createRequest = async (requestData) => {
  return await CustomizationRequest.create(requestData);
};

export const getRequestsByBuyer = async (buyerId) => {
  return await CustomizationRequest.find({ buyer: buyerId })
    .populate('product', 'name price images')
    .populate('artisan', 'name email');
};

export const getRequestsByArtisan = async (artisanId) => {
  return await CustomizationRequest.find({ artisan: artisanId })
    .populate('product', 'name price images')
    .populate('buyer', 'name email');
};

export const getRequestById = async (id) => {
  return await CustomizationRequest.findById(id)
    .populate('product', 'name price images')
    .populate('buyer', 'name email')
    .populate('artisan', 'name email');
};

export const updateRequestStatus = async (id, data) => {
  return await CustomizationRequest.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
};

export const deleteRequest = async (id) => {
  return await CustomizationRequest.findByIdAndDelete(id);
};
