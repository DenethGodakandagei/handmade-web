import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as userService from '../services/userService.js';

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, 200, 'All users', users);
  } catch (err) {
    next(err);
  }
};

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return next(
        new ErrorResponse(`No user with the id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'User found', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    sendSuccess(res, 201, 'User created', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    
    if (!user) {
         return next(
        new ErrorResponse(`No user with the id of ${req.params.id}`, 404)
      );
    }

    sendSuccess(res, 200, 'User updated', user);
  } catch (err) {
    next(err);
  }
};

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, 200, 'User deleted', {});
  } catch (err) {
    next(err);
  }
};

// @desc      Get all artisans
// @route     GET /api/v1/users/artisans/all
// @access    Public
export const getPublicArtisans = async (req, res, next) => {
  try {
    const artisans = await userService.getArtisans();
    sendSuccess(res, 200, 'Artisans fetched', artisans);
  } catch (err) {
    next(err);
  }
};

// @desc      Get single artisan
// @route     GET /api/v1/users/artisans/:id
// @access    Public
export const getPublicArtisan = async (req, res, next) => {
  try {
    const artisan = await userService.getArtisan(req.params.id);

    if (!artisan) {
      return next(new ErrorResponse('Artisan not found', 404));
    }

    sendSuccess(res, 200, 'Artisan found', artisan);
  } catch (err) {
    next(err);
  }
};
