import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
      },
      name: String,
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: Number, // store price at time of purchase
      customizationRequest: {
        type: mongoose.Schema.ObjectId,
        ref: 'CustomizationRequest'
      },
      customizations: [{
        optionName: String,
        selectedValue: String
      }]
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  isPreOrder: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries by user (Critical for scale)
OrderSchema.index({ user: 1 });

export default mongoose.model('Order', OrderSchema);
