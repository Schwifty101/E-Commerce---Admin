exports.validateSignup = (data) => {
  const errors = [];

  // Validate email
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone
  if (!data.phone) {
    errors.push('Phone number is required');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  // Validate password
  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate name
  if (!data.name) {
    errors.push('Name is required');
  }

  // Validate role if provided
  if (data.role && !['buyer', 'seller', 'admin'].includes(data.role)) {
    errors.push('Invalid role');
  }

  return errors;
};

exports.validateLogin = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return errors;
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}