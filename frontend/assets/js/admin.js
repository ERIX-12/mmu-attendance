// Admin panel JavaScript

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://your-api-domain.com';

// State management
let authToken = localStorage.getItem('adminToken');
let currentUser = null;
let currentTab = 'products';

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize admin panel
function init() {
  checkAuthStatus();
  setupEventListeners();
}

// Check authentication status
function checkAuthStatus() {
  if (authToken) {
    verifyToken();
  } else {
    showLogin();
  }
}

// Verify token with server
async function verifyToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.data.user;
      showDashboard();
      loadDashboardData();
    } else {
      logout();
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    logout();
  }
}

// Show login section
function showLogin() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

// Show dashboard section
function showDashboard() {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  
  if (currentUser) {
    userDisplay.textContent = currentUser.username;
  }
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showLoginError('Please enter username and password');
    return;
  }
  
  // Show loading state
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
  loginError.classList.add('hidden');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      authToken = data.data.token;
      currentUser = data.data.user;
      localStorage.setItem('adminToken', authToken);
      
      showDashboard();
      loadDashboardData();
    } else {
      showLoginError(data.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login failed:', error);
    showLoginError('Login failed. Please try again.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login';
  }
}

// Show login error
function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.remove('hidden');
}

// Logout
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('adminToken');
  showLogin();
}

// Load dashboard data
async function loadDashboardData() {
  await Promise.all([
    loadStats(),
    loadProducts(),
    loadContacts()
  ]);
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const products = data.data.products;
      
      // Update stats
      document.getElementById('totalProducts').textContent = products.length;
      document.getElementById('featuredProducts').textContent = products.filter(p => p.isFeatured).length;
      document.getElementById('lowStock').textContent = products.filter(p => p.stock <= 10).length;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
  
  // Load contacts count
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const contacts = data.data.contacts;
      document.getElementById('pendingContacts').textContent = contacts.filter(c => c.status === 'pending').length;
    }
  } catch (error) {
    console.error('Error loading contacts stats:', error);
  }
}

// Load products
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      displayProducts(data.data.products);
    }
  } catch (error) {
    console.error('Error loading products:', error);
    displayProducts(getDummyProducts());
  }
}

// Display products in table
function displayProducts(products) {
  const productsTable = document.getElementById('productsTable');
  if (!productsTable) return;
  
  productsTable.innerHTML = products.map(product => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <img src="${product.image}" alt="${product.name}" class="h-10 w-10 rounded-full object-cover mr-3">
          <div>
            <div class="text-sm font-medium text-gray-900 dark:text-white">${product.name}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">${product.category}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          ${product.category}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        UGX ${product.price.toLocaleString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}">
          ${product.stock} ${product.unit}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        ${product.isFeatured ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Featured</span>' : ''}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onclick="editProduct('${product._id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="deleteProduct('${product._id}')" class="text-red-600 hover:text-red-900">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Load contacts
async function loadContacts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      displayContacts(data.data.contacts);
    }
  } catch (error) {
    console.error('Error loading contacts:', error);
    displayContacts(getDummyContacts());
  }
}

// Display contacts in table
function displayContacts(contacts) {
  const contactsTable = document.getElementById('contactsTable');
  if (!contactsTable) return;
  
  contactsTable.innerHTML = contacts.map(contact => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900 dark:text-white">${contact.name}</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">${contact.phone}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        ${contact.email}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        ${contact.subject}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        ${new Date(contact.createdAt).toLocaleDateString()}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          contact.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }">
          ${contact.status}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button onclick="viewContact('${contact._id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
          <i class="fas fa-eye"></i>
        </button>
        <button onclick="updateContactStatus('${contact._id}')" class="text-green-600 hover:text-green-900">
          <i class="fas fa-check"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Tab switching
function switchTab(tabName) {
  currentTab = tabName;
  
  // Update tab buttons
  tabBtns.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('border-orange', 'text-orange');
      btn.classList.remove('border-transparent', 'text-gray-500');
    } else {
      btn.classList.remove('border-orange', 'text-orange');
      btn.classList.add('border-transparent', 'text-gray-500');
    }
  });
  
  // Update tab contents
  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
}

// Handle add product form
async function handleAddProduct(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const productData = Object.fromEntries(formData);
  
  // Convert numeric fields
  productData.price = parseFloat(productData.price);
  productData.stock = parseInt(productData.stock);
  productData.isFeatured = formData.has('isFeatured');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      showProductSuccess();
      e.target.reset();
      loadProducts();
      loadStats();
      
      // Switch to products tab
      switchTab('products');
    } else {
      showProductError(data.message || 'Failed to add product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    showProductError('Failed to add product. Please try again.');
  }
}

// Show product success message
function showProductSuccess() {
  const successMsg = document.getElementById('productSuccess');
  if (successMsg) {
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 3000);
  }
}

// Show product error message
function showProductError(message) {
  const errorMsg = document.getElementById('productError');
  if (errorMsg) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(() => {
      errorMsg.classList.add('hidden');
    }, 5000);
  }
}

// Dummy data functions
function getDummyProducts() {
  return [
    {
      _id: '1',
      name: 'Portland Cement',
      category: 'Cement',
      price: 28000,
      stock: 150,
      unit: 'bag',
      isFeatured: true,
      image: 'https://via.placeholder.com/100x100?text=Cement'
    },
    {
      _id: '2',
      name: 'Iron Sheets',
      category: 'Iron Sheets',
      price: 45000,
      stock: 75,
      unit: 'piece',
      isFeatured: false,
      image: 'https://via.placeholder.com/100x100?text=Iron'
    }
  ];
}

function getDummyContacts() {
  return [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+256772123456',
      subject: 'Product Inquiry',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ];
}

// Placeholder functions for edit/delete
function editProduct(productId) {
  console.log('Edit product:', productId);
  // Implementation would open edit modal
}

function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    console.log('Delete product:', productId);
    // Implementation would call delete API
  }
}

function viewContact(contactId) {
  console.log('View contact:', contactId);
  // Implementation would show contact details
}

function updateContactStatus(contactId) {
  console.log('Update contact status:', contactId);
  // Implementation would update contact status
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Tab buttons
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
  
  // Add product form
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
  }
  
  // Refresh products button
  const refreshBtn = document.getElementById('refreshProducts');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadProducts);
  }
  
  // Product search
  const productSearch = document.getElementById('productSearch');
  if (productSearch) {
    let searchTimeout;
    productSearch.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        // Filter products based on search
        console.log('Search:', e.target.value);
      }, 500);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
