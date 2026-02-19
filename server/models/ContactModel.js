import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add your name']
  },
  email: {
    type: String,
    required: [true, 'Please add your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Contact', ContactSchema);

// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     senderRole: {
//       type: String,
//       enum: ["CUSTOMER", "ARTISAN"],
//       required: true,
//     },
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//     message: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// const contactSchema = new mongoose.Schema(
//   {
//     inquiryType: {
//       type: String,
//       enum: ["PRODUCT", "ARTISAN", "GENERAL", "FAQ"],
//       required: true,
//     },

//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       default: null,
//     },

//     artisanId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     customerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     subject: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     messages: [messageSchema],

//     status: {
//       type: String,
//       enum: ["OPEN", "RESOLVED", "CLOSED"],
//       default: "OPEN",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Contact", contactSchema);

