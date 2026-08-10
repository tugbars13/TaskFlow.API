// src/utils/validators.js

export const validateEmail = (email) => {
  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
