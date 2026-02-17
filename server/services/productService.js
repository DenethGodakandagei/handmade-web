import Product from '../models/ProductModel.js';
import User from '../models/UserModel.js';
import Category from '../models/CategoryModel.js';

export const getAllProducts = async (reqQuery) => {
  // Copy req.query
  const queryObj = { ...reqQuery };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete from reqQuery
  removeFields.forEach(param => delete queryObj[param]);

  // Create query string
  let queryStr = JSON.stringify(queryObj);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = Product.find(JSON.parse(queryStr))
    .populate('category', 'name')
    .populate('artisan', 'name');

  // Select Fields
  if (reqQuery.select) {
    const fields = reqQuery.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (reqQuery.sort) {
    const sortBy = reqQuery.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(reqQuery.page, 10) || 1;
  const limit = parseInt(reqQuery.limit, 10) || 25; // Default limit
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const products = await query.lean();

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  return { products, pagination, count: products.length };
}

export const getProductById = async (id) => {
  return await Product.findById(id)
    .populate('category', 'name')
    .populate('artisan', 'name email bio studioName location telephone skills experience portfolio profilePicture')
    .populate('reviews');
}

export const createProduct = async (productData) => {
  return await Product.create(productData);
}

export const updateProduct = async (id, productData) => {
  return await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true
  });
}