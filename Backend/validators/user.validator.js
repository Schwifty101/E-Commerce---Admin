exports.validateUserUpdate = (data) => {
  const errors = [];

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (data.name && data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  return errors;
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s-]{10,}$/.test(phone);
}