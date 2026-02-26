import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    published: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published'],
      default: 'draft'
    },
    requiresReview: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

faqSchema.index({ published: 1, createdAt: -1 });

const Faq = mongoose.model('Faq', faqSchema);

export default Faq;
