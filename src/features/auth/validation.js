// Client-side validation for the sign-in and sign-up forms.
// Each validator returns an error message, or '' when the value is valid.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(v)) return 'Enter a valid email address.';
  return '';
}

export function validateRequired(value, label) {
  return value.trim() ? '' : `${label} is required.`;
}

// Sign-up password: at least 8 characters, with letters and numbers.
export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Use at least 8 characters with letters and numbers.';
  }
  if (value.length > 128) return 'Password must be 128 characters or fewer.';
  return '';
}

// 'Weak' | 'Medium' | 'Strong', shown next to the sign-up password label.
export function getPasswordStrength(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  if (score >= 4) return 'Strong';
  if (score >= 2) return 'Medium';
  return 'Weak';
}

export function validateSignIn({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Password is required.';
  return errors;
}

// Same limits as the backend's RegisterDto (2–80 characters).
export function validateFullName(value) {
  const v = value.trim();
  if (!v) return 'Full legal name is required.';
  if (v.length < 2) return 'Full legal name must be at least 2 characters.';
  if (v.length > 80) return 'Full legal name must be 80 characters or fewer.';
  return '';
}

export function validateSignUp({ fullName, email, password, acceptedPolicy }) {
  const errors = {};
  const nameError = validateFullName(fullName);
  if (nameError) errors.fullName = nameError;
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) errors.password = passwordError;
  if (!acceptedPolicy) errors.policy = 'Please accept the staff operating policy.';
  return errors;
}
