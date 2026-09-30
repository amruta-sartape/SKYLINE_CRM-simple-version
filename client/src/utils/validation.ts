import {
  RegisterFormData,
  LoginCredentials,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  PasswordStrength,
} from '../types/auth.types';

/**
 * Standard RFC 5322 compliant email regex check
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Phone number validation supporting international and national formats (min 7 digits)
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Strip non-digit characters to count actual numbers
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Analyze password complexity and return granular feedback
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      hasMinLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let label: PasswordStrength['label'] = 'Very Weak';
  if (score === 1) label = 'Weak';
  else if (score === 2) label = 'Fair';
  else if (score === 3) label = 'Good';
  else if (score === 4) label = 'Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Validate registration form data
 */
export function validateRegistrationForm(data: RegisterFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name must be at least 2 characters.';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Full name cannot exceed 100 characters.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number (min 7 digits).';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else {
    const strength = checkPasswordStrength(data.password);
    if (!strength.hasMinLength) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!strength.hasUppercase) {
      errors.password = 'Password must contain at least one uppercase letter (A-Z).';
    } else if (!strength.hasNumber) {
      errors.password = 'Password must contain at least one number (0-9).';
    } else if (!strength.hasSpecial) {
      errors.password = 'Password must contain at least one special character (!@#$%^&*).';
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = 'You must agree to the Terms of Service and Privacy Policy.';
  }

  return errors;
}

/**
 * Validate login form data
 */
export function validateLoginForm(data: LoginCredentials): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

/**
 * Validate forgot password form
 */
export function validateForgotPasswordForm(data: ForgotPasswordFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  return errors;
}

/**
 * Validate reset password form
 */
export function validateResetPasswordForm(data: ResetPasswordFormData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.token || !data.token.trim()) {
    errors.token = 'Reset token is missing or invalid.';
  }

  if (!data.password) {
    errors.password = 'New password is required.';
  } else {
    const strength = checkPasswordStrength(data.password);
    if (strength.score < 3) {
      errors.password = 'Please provide a stronger password meeting all requirements.';
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
