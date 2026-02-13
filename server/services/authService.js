import User from '../models/UserModel.js';

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;
  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });
  return user;
};

export const loginUser = async (email, password) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUserDetails = async (id, fieldsToUpdate) => {
  return await User.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
};

export const updateUserPassword = async (id, currentPassword, newPassword) => {
  const user = await User.findById(id).select('+password');

  // Check current password
  if (!(await user.matchPassword(currentPassword))) {
    throw new Error('Incorrect password');
  }

  user.password = newPassword;
  await user.save();
  return user;
};
