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

export const becomeSeller = async (id, applicationData) => {
  // Check if user has already applied
  const user = await User.findById(id);

  if (user.sellerRequestStatus === 'pending') {
    throw new Error('You have already submitted an application. Please wait for approval.');
  }

  if (user.sellerRequestStatus === 'approved') {
    throw new Error('You are already an approved seller.');
  }

  // If rejected, maybe we allow them to re-apply? Let's assume yes for now, or block effectively.
  // The prompt implies "no one can hack, pure secure way", so let's stick to strict checks.
  // If rejected, they might need to contact admin or we can let them re-apply.
  // For now let's just block pending/approved.

  const { studioName, telephone, portfolio, process, category, location, experience, skills } = applicationData;

  const fieldsToUpdate = {
    studioName,
    telephone,
    process,
    portfolio,
    sellerRequestStatus: 'pending',
    category,
    location,
    experience,
    skills
  };

  return await User.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
};

export const getAllApplications = async () => {
  return await User.find({ sellerRequestStatus: 'pending' });
};

export const approveApplication = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    {
      sellerRequestStatus: 'approved',
      role: 'artisan',
      isSeller: true
    },
    { new: true, runValidators: true }
  );
  return user;
};

export const rejectApplication = async (id) => {
  const user = await User.findByIdAndUpdate(
    id,
    { sellerRequestStatus: 'rejected' },
    { new: true, runValidators: true }
  );
  return user;
};
