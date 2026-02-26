import User from '../models/UserModel.js';

export const getAllUsers = async () => {
  return await User.find();
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true
  });
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const getArtisans = async () => {
  return await User.find({ role: 'artisan' });
};

export const getArtisan = async (id) => {
  return await User.findOne({ _id: id, role: 'artisan' });
};
