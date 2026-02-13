import Category from '../models/CategoryModel.js';

export const getAllCategories = async () => {
  return await Category.find();
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const createCategory = async (categoryData) => {
  return await Category.create(categoryData);
};

export const updateCategory = async (id, categoryData) => {
  return await Category.findByIdAndUpdate(id, categoryData, {
    new: true,
    runValidators: true
  });
};

export const deleteCategory = async (id) => {
  return await Category.findByIdAndDelete(id);
};
