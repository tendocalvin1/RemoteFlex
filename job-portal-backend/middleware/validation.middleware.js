import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('role')
    .isIn(['job_seeker', 'employer'])
    .withMessage('Role must be either job_seeker or employer'),

  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// User profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),

  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('companyWebsite')
    .optional()
    .isURL()
    .withMessage('Company website must be a valid URL'),

  body('companyLogo')
    .optional()
    .isURL()
    .withMessage('Company logo must be a valid URL'),

  body('companyTagline')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Company tagline cannot exceed 200 characters'),

  body('companyDescription')
    .optional()
    .trim()
    .isLength({ max: 800 })
    .withMessage('Company description cannot exceed 800 characters'),

  handleValidationErrors
];

// Password reset validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  handleValidationErrors
];

// Password reset validation
export const validateResetPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  handleValidationErrors
];

// Job creation validation
export const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Job title must be between 5 and 150 characters'),

  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),

  body('description')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters'),

  body('category')
    .isIn(['engineering', 'design', 'marketing', 'sales', 'finance', 'ops', 'other'])
    .withMessage('Invalid job category'),

  body('remoteType')
    .isIn(['remote', 'onsite', 'hybrid'])
    .withMessage('Remote type must be remote, onsite, or hybrid'),

  body('salaryMin')
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),

  body('salaryMax')
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.salaryMin) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary');
      }
      return true;
    }),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),

  body('companyWebsite')
    .optional()
    .isURL()
    .withMessage('Company website must be a valid URL'),

  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),

  body('requirements.*')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Each requirement must be between 5 and 200 characters'),

  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),

  body('responsibilities.*')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Each responsibility must be between 5 and 200 characters'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),

  handleValidationErrors
];