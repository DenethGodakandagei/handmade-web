import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0
  },
  isPreOrder: {
    type: Boolean,
    default: false
  },
  images: {
    type: [String],
    default: []
  },
  video: {
    type: String, // URL to uploaded video
    default: null
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  artisan: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    district: { type: String, required: true },
    area: { type: String, required: true },
    coordinates: {
       lat: Number,
       lng: Number
    }
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating can not be more than 5']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

export default mongoose.model('Product', ProductSchema);
