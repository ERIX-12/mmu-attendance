// Main JavaScript for KRISHNI ENTERPRISES website

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://your-api-domain.com';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

// Toggle theme
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
}

// Toggle mobile menu
function toggleMobileMenu() {
  mobileMenu.classList.toggle('hidden');
}

// Load featured products for carousel
async function loadFeaturedProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products?featured=true&limit=5`);
    const data = await response.json();
    
    if (data.status === 'success') {
      displayFeaturedProducts(data.data.products);
    }
  } catch (error) {
    console.error('Error loading featured products:', error);
    // Fallback to dummy products
    displayFeaturedProducts(getDummyProducts());
  }
}

// Display featured products in carousel
function displayFeaturedProducts(products) {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;
  
  carousel.innerHTML = products.map(product => `
    <div class="carousel-item min-w-full md:min-w-0 md:w-1/3 px-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2 text-navy dark:text-white">${product.name}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">${product.description}</p>
          <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-orange">UGX ${product.price.toLocaleString()}</span>
            <span class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
              ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Dummy products for fallback
function getDummyProducts() {
  return [
    {
      name: "Portland Cement",
      description: "High-quality Portland cement suitable for all construction needs",
      price: 28000,
      stock: 150,
      image: "https://via.placeholder.com/300x200?text=Cement"
    },
    {
      name: "Iron Sheets",
      description: "Durable galvanized iron sheets for roofing",
      price: 45000,
      stock: 75,
      image: "https://via.placeholder.com/300x200?text=Iron+Sheets"
    },
    {
      name: "PVC Pipes",
      description: "Quality PVC pipes for plumbing applications",
      price: 15000,
      stock: 200,
      image: "https://via.placeholder.com/300x200?text=PVC+Pipes"
    }
  ];
}

// Carousel functionality
function initCarousel() {
  const carousel = document.getElementById('carousel');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!carousel || !prevBtn || !nextBtn) return;
  
  let currentIndex = 0;
  const items = carousel.querySelectorAll('.carousel-item');
  
  if (items.length === 0) return;
  
  function updateCarousel() {
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
  }
  
  prevBtn.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    updateCarousel();
  });
  
  nextBtn.addEventListener('click', () => {
    currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    updateCarousel();
  });
  
  // Auto-rotate carousel
  setInterval(() => {
    currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    updateCarousel();
  }, 5000);
}

// Form validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  const re = /^[\d\s\-\+\(\)]+$/;
  return re.test(phone) && phone.length >= 10;
}

// Show notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  notification.innerHTML = `
    <div class="flex items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadFeaturedProducts();
  initCarousel();
  
  // Event listeners
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenuBtn && mobileMenu && 
        !mobileMenuBtn.contains(e.target) && 
        !mobileMenu.contains(e.target)) {
      mobileMenu.classList.add('hidden');
    }
  });
});

// Export functions for use in other files
window.KrishniApp = {
  API_BASE_URL,
  validateEmail,
  validatePhone,
  showNotification
};
