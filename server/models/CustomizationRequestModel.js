import mongoose from 'mongoose';

const CustomizationRequestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  size: {
    type: String,
    required: [true, 'Please specify size']
  },
  color: {
    type: String,
    required: [true, 'Please specify color']
  },
  customMessage: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  designImage: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CustomizationRequest', CustomizationRequestSchema);
