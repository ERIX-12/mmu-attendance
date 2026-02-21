// Contact page JavaScript

// DOM elements
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Form validation
function validateForm() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value.trim();
  
  let isValid = true;
  
  // Reset error messages
  document.querySelectorAll('.text-red-500').forEach(el => el.classList.add('hidden'));
  
  // Validate name
  if (!name) {
    document.getElementById('nameError').classList.remove('hidden');
    isValid = false;
  }
  
  // Validate email
  if (!email || !window.KrishniApp.validateEmail(email)) {
    document.getElementById('emailError').classList.remove('hidden');
    isValid = false;
  }
  
  // Validate phone
  if (!phone || !window.KrishniApp.validatePhone(phone)) {
    document.getElementById('phoneError').classList.remove('hidden');
    isValid = false;
  }
  
  // Validate subject
  if (!subject) {
    document.getElementById('subjectError').classList.remove('hidden');
    isValid = false;
  }
  
  // Validate message
  if (!message || message.length < 10) {
    document.getElementById('messageError').textContent = message.length < 10 ? 'Message must be at least 10 characters' : 'Message is required';
    document.getElementById('messageError').classList.remove('hidden');
    isValid = false;
  }
  
  return isValid;
}

// Submit contact form
async function submitContactForm(e) {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value.trim()
  };
  
  // Show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
  
  try {
    const response = await fetch(`${window.KrishniApp.API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      // Show success message
      successMessage.classList.remove('hidden');
      contactForm.reset();
      
      // Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth' });
      
      // Track form submission (if analytics is available)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission', {
          'event_category': 'Contact',
          'event_label': 'Contact Form'
        });
      }
    } else {
      throw new Error(data.message || 'Failed to submit form');
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    errorMessage.classList.remove('hidden');
    errorMessage.scrollIntoView({ behavior: 'smooth' });
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Message';
  }
}

// Pre-fill form from URL parameters
function prefillForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const subject = urlParams.get('subject');
  const message = urlParams.get('message');
  
  if (subject) {
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect) {
      // Try to find matching option
      const options = Array.from(subjectSelect.options);
      const matchingOption = options.find(option => 
        option.value.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(option.value.toLowerCase())
      );
      
      if (matchingOption) {
        subjectSelect.value = matchingOption.value;
      } else {
        // If no match, select "Other" and set the subject as message
        subjectSelect.value = 'Other';
        const messageField = document.getElementById('message');
        if (messageField && !message) {
          messageField.value = `Subject: ${subject}\n\n`;
        }
      }
    }
  }
  
  if (message) {
    const messageField = document.getElementById('message');
    if (messageField) {
      messageField.value = message;
    }
  }
}

// Phone number formatting
function formatPhoneNumber(input) {
  // Remove all non-digit characters
  let phoneNumber = input.replace(/\D/g, '');
  
  // Format for Uganda numbers
  if (phoneNumber.startsWith('256')) {
    phoneNumber = '+' + phoneNumber;
  } else if (phoneNumber.startsWith('0')) {
    phoneNumber = '+256' + phoneNumber.substring(1);
  } else if (phoneNumber.length === 9 && phoneNumber.startsWith('7')) {
    phoneNumber = '+256' + phoneNumber;
  }
  
  return phoneNumber;
}

// Add phone formatting
function setupPhoneFormatting() {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      const formatted = formatPhoneNumber(phoneInput.value);
      if (formatted !== phoneInput.value) {
        phoneInput.value = formatted;
      }
    });
    
    phoneInput.addEventListener('input', (e) => {
      // Allow only digits and basic formatting characters
      e.target.value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
    });
  }
}

// Character counter for message field
function setupCharacterCounter() {
  const messageField = document.getElementById('message');
  if (messageField) {
    // Add character counter display
    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-500 dark:text-gray-400 mt-1 text-right';
    counter.textContent = '0 / 1000 characters';
    messageField.parentNode.appendChild(counter);
    
    messageField.addEventListener('input', () => {
      const length = messageField.value.length;
      counter.textContent = `${length} / 1000 characters`;
      
      if (length > 1000) {
        counter.classList.add('text-red-500');
        messageField.value = messageField.value.substring(0, 1000);
      } else {
        counter.classList.remove('text-red-500');
      }
    });
  }
}

// Auto-save form data to localStorage
function setupAutoSave() {
  const formFields = ['name', 'email', 'phone', 'subject', 'message'];
  
  // Load saved data
  formFields.forEach(field => {
    const element = document.getElementById(field);
    if (element) {
      const savedValue = localStorage.getItem(`contact_${field}`);
      if (savedValue) {
        element.value = savedValue;
      }
      
      // Save on input
      element.addEventListener('input', () => {
        localStorage.setItem(`contact_${field}`, element.value);
      });
    }
  });
  
  // Clear saved data on successful submission
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      formFields.forEach(field => {
        localStorage.removeItem(`contact_${field}`);
      });
    });
  }
}

// Initialize contact page
document.addEventListener('DOMContentLoaded', () => {
  prefillForm();
  setupPhoneFormatting();
  setupCharacterCounter();
  setupAutoSave();
  
  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', submitContactForm);
  }
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add form field animations
  const formInputs = document.querySelectorAll('input, select, textarea');
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('transform', 'scale-105');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('transform', 'scale-105');
    });
  });
});
