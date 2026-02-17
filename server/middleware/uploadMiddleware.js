import multer from 'multer';
import path from 'path';
import { ErrorResponse } from '../utils/responseUtils.js';

// Set storage engine
import { storage } from '../config/cloudinary.js';

// Use Cloudinary storage
// const storage = ... (replaced by import)

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Images and Videos Only!', 400));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (for videos)
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

export default upload;
