const form = document.getElementById('form');
const firstnameInput = document.getElementById('firstname-input');
const emailInput = document.getElementById('email-input');
const phoneInput = document.getElementById('phone-input');
const passwordInput = document.getElementById('password-input');
const repeatPasswordInput = document.getElementById('repeat-password-input');
const errorMessage = document.getElementById('error-message');

// Add submit event listener to the form
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent default form submission
  var errors = [];

  try {
    // Determine if it's a signup or login form based on the presence of firstnameInput
    if (firstnameInput) {
      errors = validateSignupForm();
    } else {
      errors = validateLoginForm();
    }

    if (errors.length > 0) {
      // Display errors
      errorMessage.innerText = errors.join('. ');
      errorMessage.style.color = 'red';
    } else {
      // If no errors, proceed with form submission
      errorMessage.innerText = 'Form is valid. Submitting...';
      errorMessage.style.color = 'green';
      form.submit(); // Actually submit the form
    }
  } catch (error) {
    // Handle unexpected errors
    errorMessage.innerText = 'An error occurred: ' + error.message;
    errorMessage.style.color = 'red';
  }
});

function validateSignupForm() {
  var errors = [];

  // Firstname validation
  if (!firstnameInput.value.trim()) {
    errors.push('Firstname is required');
  }

  // Email validation
  if (!emailInput.value.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(emailInput.value.trim())) {
    errors.push('Invalid email format');
  }

  // Phone Number validation
  const phoneError = validatePhoneNumber(phoneInput.value);
  if (phoneError) {
    errors.push(phoneError);
  }

  // Password validation
  if (passwordInput && repeatPasswordInput) {
      const passwordError = validatePasswords(passwordInput.value, repeatPasswordInput.value);
      if (passwordError) {
          errors.push(passwordError);
      }
  }

  return errors;
}

// Basic email format validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhoneNumber(phoneNumber) {
  if (phoneNumber.length !== 10) {
    return "Phone number must be 10 digits.";
  }
  return null;
}

function validatePasswords(password, repeatPassword) {
  if (password !== repeatPassword) {
    return "Passwords must match.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*).";
  }
  return null;
}

function validateLoginForm() {
  var errors = [];
  if (!emailInput.value) {
    errors.push('Email is required');
  }
  if (!passwordInput.value) {
    errors.push('Password is required');
  }
  return errors;
}

// Clear error messages on input change
var allInputs = [firstnameInput, emailInput, phoneInput, passwordInput, repeatPasswordInput].filter(input => input);
allInputs.forEach(input => {
  input.addEventListener('input', function() {
    errorMessage.innerText = '';
  });
});