import { ErrorResponse, sendSuccess } from '../utils/responseUtils.js';
import * as customizationService from '../services/customizationRequestService.js';
import Product from '../models/ProductModel.js';

// @desc      Create customization request
// @route     POST /api/v1/customizations
// @access    Private (Buyer)
export const createCustomizationRequest = async (req, res, next) => {
  try {
    const { product, customizations, customMessage } = req.body;

    const targetProduct = await Product.findById(product);
    if (!targetProduct) {
      return next(new ErrorResponse(`Product not found with id ${product}`, 404));
    }

    const requestData = {
      buyer: req.user.id,
      artisan: targetProduct.artisan,
      product,
      customizations: typeof customizations === 'string' ? JSON.parse(customizations) : customizations,
      notes: customMessage,
      designImage: req.file ? req.file.path : null
    };

    const customizationRequest = await customizationService.createRequest(requestData);

    sendSuccess(res, 201, 'Customization request sent to artisan', customizationRequest);
  } catch (err) {
    next(err);
  }
};

// @desc      Get all customization requests for logged in user
// @route     GET /api/v1/customizations
// @access    Private
export const getMyCustomizationRequests = async (req, res, next) => {
  try {
    let requests;
    if (req.user.role === 'artisan') {
      requests = await customizationService.getRequestsByArtisan(req.user.id);
    } else {
      requests = await customizationService.getRequestsByBuyer(req.user.id);
    }
    sendSuccess(res, 200, 'Fetched customization requests', requests);
  } catch (err) {
    next(err);
  }
};

// @desc      Update customization request status
// @route     PUT /api/v1/customizations/:id/status
// @access    Private (Artisan)
export const updateCustomizationStatus = async (req, res, next) => {
  try {
    const request = await customizationService.getRequestById(req.params.id);

    if (!request) {
      return next(new ErrorResponse(`Request not found with id ${req.params.id}`, 404));
    }

    // Only the assigned artisan can update the status
    if (request.artisan._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this request', 403));
    }

    const updateData = { status: req.body.status };
    if (req.body.price !== undefined) {
      updateData.price = req.body.price;
    }

    const updatedRequest = await customizationService.updateRequestStatus(req.params.id, updateData);

    sendSuccess(res, 200, 'Status updated', updatedRequest);
  } catch (err) {
    next(err);
  }
};
