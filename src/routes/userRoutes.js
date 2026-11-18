const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllUsers,
  registerUser,
  loginUser,
  updateProfilePhoto,
  updatePassword,
} = require('../controllers/userController');

// Configure Multer for Profile Photos
const uploadDir = './uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, or WEBP images are allowed!'), false);
  }
};

const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes
router.get('/', getAllUsers);
router.post('/register', registerUser); // Connect "Add Representative" modal here
router.post('/login', loginUser);
router.patch('/:id/photo', uploadAvatar.single('photo'), updateProfilePhoto); // Connect Change Photo here
router.patch('/:id/password', updatePassword); // Connect Password Update here

module.exports = router;