const validator = require('validator')

// signup + login validation

const alphabets = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';

const validateEmail = (email) => {
    const characters = '-_.@'
    const whitelistedCharacters = alphabets + numbers + characters
    if (!validator.isEmail(email)) {
        return {
            valid: false,
            error: 'Invalid format for email'
        }
    }
    if(!validator.isWhitelisted(email, whitelistedCharacters)) {
        return {
            valid: false,
            error: 'Special characters allowed in email are: - _ . @'
        }
    }
    return {
        valid: true
    };
}

const validatePassword = (password) => {
    const passwordCharacters = '-_.@#£$%!?'
    const whitelistedPasswordCharacters = alphabets + numbers + passwordCharacters
    if (!validator.isWhitelisted(password, whitelistedPasswordCharacters)) {
        return {
            value: false,
            error: 'Invalid password - special characters accepted: - _ . @ # £ $ % ! ?'
        };
    }
    if (!(password.length >= 6 && password.length <= 20)) {
        return {
            value: false,
            error: 'Invalid password, must be 6 - 20 characters long'
        };
    }
    return {
        valid: true
    };
};

const validateEmailAndPassword = (email, password) => {
    const emailValidationResult = validateEmail(email);
    if (!emailValidationResult.valid) {
      return { valid: false, error: emailValidationResult.error };
    }
  
    const passwordValidationResult = validatePassword(password);
    if (!passwordValidationResult.valid) {
      return { valid: false, error: passwordValidationResult.error };
    }
  
    return { valid: true };
}

// post req validation

const validateTitle = (title) => {
    const allowedPattern = /^[a-zA-Z0-9-_.@#£$%!?()/: ]+$/;
    if (!allowedPattern.test(title)) {
      return {
        value: false,
        error: 'Invalid input characters accepted: a-z, A-Z, 0-9, - _ . @ # £ $ % ! ? ( ) / :'
      };
    }
    
    return { value: true };
  };
  

const validateToDo = (email, title) => {
    // email check
    const emailValidationResult = validateEmail(email);
    if (!emailValidationResult.valid) {
      return { valid: false, error: emailValidationResult.error };
    }

    // title check
    const titleValidationResult = validateTitle(title)
    if (!titleValidationResult.value) {
        return { valid: false, error: titleValidationResult.error }
    }
    return { valid: true }
}

module.exports = { validateEmailAndPassword, validateEmail, validateToDo }
