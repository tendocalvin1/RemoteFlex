import sanitizeHtml from 'sanitize-html';

// Middleware to sanitize HTML and prevent XSS
export const sanitizeInput = (req, res, next) => {
  // Sanitize string fields in body
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Allow basic formatting but remove dangerous tags
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
          allowedAttributes: {
            'a': ['href', 'target']
          },
          allowedSchemes: ['http', 'https', 'mailto']
        });
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  next();
};

// Middleware to limit request size and prevent DoS
export const limitPayloadSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);

  // Limit to 1MB for regular requests
  if (contentLength && contentLength > 1024 * 1024) {
    return res.status(413).json({
      error: 'Request too large. Maximum size is 1MB.'
    });
  }

  next();
};