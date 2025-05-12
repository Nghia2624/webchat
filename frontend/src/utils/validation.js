/**
 * Utility functions for form validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!password) {
    result.isValid = false;
    result.errors.push('Password is required');
    return result;
  }

  if (password.length < 8) {
    result.isValid = false;
    result.errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    result.isValid = false;
    result.errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return result;
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!username) {
    result.isValid = false;
    result.errors.push('Username is required');
    return result;
  }

  if (username.length < 3) {
    result.isValid = false;
    result.errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 20) {
    result.isValid = false;
    result.errors.push('Username must be at most 20 characters long');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    result.isValid = false;
    result.errors.push('Username can only contain letters, numbers, underscores and hyphens');
  }

  return result;
};

/**
 * Validate message content
 * @param {string} content - Message content to validate
 * @returns {Object} Validation result
 */
export const validateMessage = (content) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!content) {
    result.isValid = false;
    result.errors.push('Message content is required');
    return result;
  }

  if (content.length > 1000) {
    result.isValid = false;
    result.errors.push('Message must be at most 1000 characters long');
  }

  return result;
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles = 1
  } = options;

  const result = {
    isValid: true,
    errors: []
  };

  if (!file) {
    result.isValid = false;
    result.errors.push('File is required');
    return result;
  }

  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(`File size must be less than ${maxSize / 1024 / 1024}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    result.isValid = false;
    result.errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  return result;
};

/**
 * Validate form fields
 * @param {Object} values - Form values
 * @param {Object} validationRules - Validation rules
 * @returns {Object} Validation result
 */
export const validateForm = (values, validationRules) => {
  const result = {
    isValid: true,
    errors: {}
  };

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = values[field];
    const fieldErrors = [];

    for (const rule of rules) {
      if (rule.required && !value) {
        fieldErrors.push(`${field} is required`);
        continue;
      }

      if (value) {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${field} must be at least ${rule.minLength} characters long`);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${field} must be at most ${rule.maxLength} characters long`);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message || `${field} is invalid`);
        }

        if (rule.validate) {
          const customValidation = rule.validate(value, values);
          if (customValidation) {
            fieldErrors.push(customValidation);
          }
        }
      }
    }

    if (fieldErrors.length > 0) {
      result.isValid = false;
      result.errors[field] = fieldErrors;
    }
  }

  return result;
};

/**
 * Validate search query
 * @param {string} query - Search query to validate
 * @returns {Object} Validation result
 */
export const validateSearchQuery = (query) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!query) {
    result.isValid = false;
    result.errors.push('Search query is required');
    return result;
  }

  if (query.length < 2) {
    result.isValid = false;
    result.errors.push('Search query must be at least 2 characters long');
  }

  if (query.length > 50) {
    result.isValid = false;
    result.errors.push('Search query must be at most 50 characters long');
  }

  return result;
};

/**
 * Validate friend request
 * @param {string} userId - User ID to validate
 * @returns {Object} Validation result
 */
export const validateFriendRequest = (userId) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!userId) {
    result.isValid = false;
    result.errors.push('User ID is required');
    return result;
  }

  if (typeof userId !== 'string') {
    result.isValid = false;
    result.errors.push('User ID must be a string');
  }

  return result;
};

/**
 * Validate conversation name
 * @param {string} name - Conversation name to validate
 * @returns {Object} Validation result
 */
export const validateConversationName = (name) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!name) {
    result.isValid = false;
    result.errors.push('Conversation name is required');
    return result;
  }

  if (name.length < 3) {
    result.isValid = false;
    result.errors.push('Conversation name must be at least 3 characters long');
  }

  if (name.length > 50) {
    result.isValid = false;
    result.errors.push('Conversation name must be at most 50 characters long');
  }

  return result;
};

/**
 * Validate group participants
 * @param {Array<string>} participants - Participant IDs to validate
 * @returns {Object} Validation result
 */
export const validateGroupParticipants = (participants) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (!participants) {
    result.isValid = false;
    result.errors.push('Participants are required');
    return result;
  }

  if (!Array.isArray(participants)) {
    result.isValid = false;
    result.errors.push('Participants must be an array');
    return result;
  }

  if (participants.length < 2) {
    result.isValid = false;
    result.errors.push('Group must have at least 2 participants');
  }

  if (participants.length > 50) {
    result.isValid = false;
    result.errors.push('Group cannot have more than 50 participants');
  }

  const uniqueParticipants = new Set(participants);
  if (uniqueParticipants.size !== participants.length) {
    result.isValid = false;
    result.errors.push('Duplicate participants are not allowed');
  }

  return result;
}; 