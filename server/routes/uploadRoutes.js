const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, async (req, res) => {
  try {
    // Check if file exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    const imageFile = req.files.image;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
      });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB'
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(imageFile.tempFilePath, 'images');
    
    // Delete temporary file
    fs.unlinkSync(imageFile.tempFilePath);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// @desc    Upload video
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, async (req, res) => {
  try {
    // Check if file exists
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }
    
    const videoFile = req.files.video;
    
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(videoFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only MP4, MPEG, MOV, and AVI videos are allowed'
      });
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (videoFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB'
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(videoFile.tempFilePath, 'videos');
    
    // Delete temporary file
    fs.unlinkSync(videoFile.tempFilePath);
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video',
      error: error.message
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: 'Please upload image files'
      });
    }
    
    // Handle both single and multiple file uploads
    const images = Array.isArray(req.files.images) 
      ? req.files.images 
      : [req.files.images];
    
    // Validate max number of files
    if (images.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per upload'
      });
    }
    
    const uploadPromises = images.map(async (image) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(image.mimetype)) {
        throw new Error(`Invalid file type for ${image.name}`);
      }
      
      // Validate file size
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (image.size > maxSize) {
        throw new Error(`File ${image.name} exceeds 5MB limit`);
      }
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(image.tempFilePath, 'images');
      
      // Delete temporary file
      fs.unlinkSync(image.tempFilePath);
      
      return {
        url: result.url,
        publicId: result.publicId,
        originalName: image.name
      };
    });
    
    const uploadedImages = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// @desc    Delete image/video from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
router.delete('/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }
    
    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// @desc    Upload avatar/profile picture
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', protect, async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an avatar image'
      });
    }
    
    const avatarFile = req.files.avatar;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'
      });
    }
    
    // Validate file size (max 2MB for avatars)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (avatarFile.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 2MB'
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(avatarFile.tempFilePath, 'avatars');
    
    // Delete temporary file
    fs.unlinkSync(avatarFile.tempFilePath);
    
    // Update user's avatar in database
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { avatar: result.url });
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      url: result.url,
      publicId: result.publicId
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
});

// @desc    Upload mission proof (image or video)
// @route   POST /api/upload/proof
// @access  Private
router.post('/proof', protect, async (req, res) => {
  try {
    if (!req.files || (!req.files.image && !req.files.video)) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image or video as proof'
      });
    }
    
    const file = req.files.image || req.files.video;
    const fileType = req.files.image ? 'image' : 'video';
    
    // Validate based on type
    if (fileType === 'image') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image type'
        });
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'Image size too large. Maximum 5MB'
        });
      }
    } else {
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid video type'
        });
      }
      
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: 'Video size too large. Maximum 50MB'
        });
      }
    }
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.tempFilePath, `proofs/${fileType}s`);
    
    // Delete temporary file
    fs.unlinkSync(file.tempFilePath);
    
    res.json({
      success: true,
      message: 'Proof uploaded successfully',
      url: result.url,
      publicId: result.publicId,
      type: fileType
    });
  } catch (error) {
    console.error('Proof upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading proof',
      error: error.message
    });
  }
});

module.exports = router;
