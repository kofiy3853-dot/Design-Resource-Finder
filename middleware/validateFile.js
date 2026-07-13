/**
 * File validation middleware for upload endpoints
 * Validates file type, size, and existence
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf'];

/**
 * Middleware to validate uploaded files
 */
function validateFile(req, res, next) {
  // Check if file exists
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_SELECTED',
        title: 'No File Selected',
        message: 'Please select a file to upload.',
      },
    });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_TYPE',
        title: 'Unsupported File Format',
        message: 'Please upload PNG, JPG, WEBP, SVG, or PDF files.',
        supportedFormats: ALLOWED_TYPES,
      },
    });
  }

  // Validate file size
  if (req.file.size > MAX_FILE_SIZE) {
    const sizeMB = (req.file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);

    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        title: 'File Too Large',
        message: `File size is ${sizeMB}MB. Maximum allowed size is ${maxMB}MB.`,
        fileSize: req.file.size,
        maxSize: MAX_FILE_SIZE,
      },
    });
  }

  // Validate filename
  if (!req.file.filename) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE',
        title: 'Invalid File',
        message: 'File must have a valid name.',
      },
    });
  }

  // Check file name length
  if (req.file.filename.length > 255) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILENAME_TOO_LONG',
        title: 'Filename Too Long',
        message: 'Filename must be less than 255 characters.',
      },
    });
  }

  // All validations passed
  next();
}

/**
 * Validate multiple files
 */
function validateMultipleFiles(maxFiles = 10) {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES_SELECTED',
          title: 'No Files Selected',
          message: 'Please select at least one file to upload.',
        },
      });
    }

    if (req.files.length > maxFiles) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          title: 'Too Many Files',
          message: `You can upload a maximum of ${maxFiles} files at once.`,
          submitted: req.files.length,
          maxAllowed: maxFiles,
        },
      });
    }

    const invalidFiles = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Check file type
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        invalidFiles.push({
          filename: file.originalname,
          reason: 'Unsupported file format',
        });
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({
          filename: file.originalname,
          reason: `File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
        });
      }
    }

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SOME_FILES_INVALID',
          title: 'Some Files Are Invalid',
          message: `${invalidFiles.length} file(s) could not be processed.`,
          invalidFiles,
        },
      });
    }

    next();
  };
}

/**
 * Extract file metadata
 */
function getFileMetadata(file) {
  return {
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    sizeMB: (file.size / (1024 * 1024)).toFixed(2),
    mimetype: file.mimetype,
    encoding: file.encoding,
    path: file.path,
    uploadTime: new Date(),
  };
}

module.exports = {
  validateFile,
  validateMultipleFiles,
  getFileMetadata,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
};
