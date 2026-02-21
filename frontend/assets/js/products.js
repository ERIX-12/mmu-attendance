// Products page JavaScript

// State management
let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';
let viewMode = 'grid';

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const productCount = document.getElementById('productCount');
const pagination = document.getElementById('pagination');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const gridView = document.getElementById('gridView');
const listView = document.getElementById('listView');

// Load products
async function loadProducts(page = 1, append = false) {
  try {
    if (!append) {
      loadingState.classList.remove('hidden');
      emptyState.classList.add('hidden');
      productsGrid.innerHTML = '';
    }
    
    const params = new URLSearchParams({
      page: page,
      limit: 12,
      category: currentCategory === 'all' ? '' : currentCategory,
      search: currentSearch,
      sort: currentSort
    });
    
    const response = await fetch(`${window.KrishniApp.API_BASE_URL}/api/products?${params}`);
    const data = await response.json();
    
    loadingState.classList.add('hidden');
    
    if (data.status === 'success') {
      const { products, pagination: pageInfo } = data.data;
      
      if (products.length === 0 && !append) {
        emptyState.classList.remove('hidden');
        productCount.textContent = '0';
        return;
      }
      
      if (!append) {
        productsGrid.innerHTML = '';
        currentPage = page;
      }
      
      displayProducts(products, append);
      updateProductCount(pageInfo.total);
      updatePagination(pageInfo);
    } else {
      throw new Error('Failed to load products');
    }
  } catch (error) {
    console.error('Error loading products:', error);
    loadingState.classList.add('hidden');
    
    // Load dummy products as fallback
    const dummyProducts = getDummyProducts();
    displayProducts(dummyProducts);
    updateProductCount(dummyProducts.length);
  }
}

// Display products
function displayProducts(products, append = false) {
  const productsHTML = products.map(product => {
    if (viewMode === 'grid') {
      return createProductCard(product);
    } else {
      return createProductListItem(product);
    }
  }).join('');
  
  if (append) {
    productsGrid.insertAdjacentHTML('beforeend', productsHTML);
  } else {
    productsGrid.innerHTML = productsHTML;
  }
}

// Create product card for grid view
function createProductCard(product) {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="relative">
        <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
        ${product.isFeatured ? '<span class="absolute top-2 right-2 bg-orange text-white px-2 py-1 rounded text-xs font-semibold">Featured</span>' : ''}
        ${product.stock <= 10 ? '<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Low Stock</span>' : ''}
      </div>
      <div class="p-6">
        <h3 class="text-xl font-semibold mb-2 text-navy dark:text-white">${product.name}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${product.category}</p>
        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">${product.description}</p>
        <div class="flex justify-between items-center mb-4">
          <span class="text-2xl font-bold text-orange">UGX ${product.price.toLocaleString()}</span>
          <span class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
            ${product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>
        <div class="flex gap-2">
          <button onclick="viewProductDetails('${product._id}')" class="flex-1 bg-navy hover:bg-blue-700 text-white py-2 px-4 rounded transition">
            <i class="fas fa-eye mr-2"></i>View
          </button>
          <button onclick="contactAboutProduct('${product.name}')" class="flex-1 bg-orange hover:bg-orange-600 text-white py-2 px-4 rounded transition">
            <i class="fas fa-phone mr-2"></i>Inquire
          </button>
        </div>
      </div>
    </div>
  `;
}

// Create product list item for list view
function createProductListItem(product) {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-300">
      <div class="flex flex-col md:flex-row gap-6">
        <img src="${product.image}" alt="${product.name}" class="w-full md:w-48 h-48 object-cover rounded-lg">
        <div class="flex-1">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-xl font-semibold text-navy dark:text-white">${product.name}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">${product.category}</p>
            </div>
            <div class="text-right">
              <span class="text-2xl font-bold text-orange">UGX ${product.price.toLocaleString()}</span>
              <p class="text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}">
                ${product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </p>
            </div>
          </div>
          <p class="text-gray-600 dark:text-gray-400 mb-4">${product.description}</p>
          <div class="flex gap-2">
            <button onclick="viewProductDetails('${product._id}')" class="bg-navy hover:bg-blue-700 text-white py-2 px-4 rounded transition">
              <i class="fas fa-eye mr-2"></i>View Details
            </button>
            <button onclick="contactAboutProduct('${product.name}')" class="bg-orange hover:bg-orange-600 text-white py-2 px-4 rounded transition">
              <i class="fas fa-phone mr-2"></i>Contact About This
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update product count
function updateProductCount(total) {
  if (productCount) {
    productCount.textContent = total.toLocaleString();
  }
}

// Update pagination
function updatePagination(pageInfo) {
  if (!pagination) return;
  
  const { page, pages } = pageInfo;
  
  if (pages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  if (page > 1) {
    paginationHTML += `<button onclick="loadProducts(${page - 1})" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      <i class="fas fa-chevron-left"></i>
    </button>`;
  }
  
  // Page numbers
  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(pages, page + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === page;
    paginationHTML += `<button onclick="loadProducts(${i})" class="px-3 py-2 ${isActive ? 'bg-orange text-white' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      ${i}
    </button>`;
  }
  
  // Next button
  if (page < pages) {
    paginationHTML += `<button onclick="loadProducts(${page + 1})" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
      <i class="fas fa-chevron-right"></i>
    </button>`;
  }
  
  pagination.innerHTML = paginationHTML;
}

// View product details
function viewProductDetails(productId) {
  // This could open a modal or navigate to a product details page
  window.KrishniApp.showNotification('Product details feature coming soon!', 'success');
}

// Contact about product
function contactAboutProduct(productName) {
  // Navigate to contact page with pre-filled subject
  window.location.href = `contact.html?subject=Product Inquiry: ${productName}`;
}

// Toggle view mode
function toggleView(mode) {
  viewMode = mode;
  
  if (mode === 'grid') {
    gridView.classList.add('bg-orange', 'text-white');
    gridView.classList.remove('bg-gray-200', 'dark:bg-gray-700');
    listView.classList.remove('bg-orange', 'text-white');
    listView.classList.add('bg-gray-200', 'dark:bg-gray-700');
    productsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
  } else {
    listView.classList.add('bg-orange', 'text-white');
    listView.classList.remove('bg-gray-200', 'dark:bg-gray-700');
    gridView.classList.remove('bg-orange', 'text-white');
    gridView.classList.add('bg-gray-200', 'dark:bg-gray-700');
    productsGrid.className = 'space-y-6';
  }
  
  loadProducts(currentPage);
}

// Get dummy products for fallback
function getDummyProducts() {
  return [
    {
      _id: '1',
      name: 'Portland Cement',
      category: 'Cement',
      description: 'High-quality Portland cement suitable for all construction needs. Perfect for foundations, walls, and general construction.',
      price: 28000,
      stock: 150,
      unit: 'bag',
      isFeatured: true,
      image: 'https://via.placeholder.com/300x200?text=Cement'
    },
    {
      _id: '2',
      name: 'Galvanized Iron Sheets',
      category: 'Iron Sheets',
      description: 'Durable galvanized iron sheets for roofing applications. Long-lasting and weather-resistant.',
      price: 45000,
      stock: 75,
      unit: 'piece',
      isFeatured: true,
      image: 'https://via.placeholder.com/300x200?text=Iron+Sheets'
    },
    {
      _id: '3',
      name: 'PVC Pipes',
      category: 'Plumbing',
      description: 'Quality PVC pipes for plumbing applications. Available in various sizes for different needs.',
      price: 15000,
      stock: 200,
      unit: 'meter',
      image: 'https://via.placeholder.com/300x200?text=PVC+Pipes'
    },
    {
      _id: '4',
      name: 'Electrical Cables',
      category: 'Electrical',
      description: 'High-quality electrical cables for safe and reliable electrical installations.',
      price: 8500,
      stock: 300,
      unit: 'meter',
      image: 'https://via.placeholder.com/300x200?text=Electrical+Cables'
    },
    {
      _id: '5',
      name: 'Emulsion Paint',
      category: 'Paints',
      description: 'Premium quality emulsion paint for interior and exterior walls. Available in various colors.',
      price: 35000,
      stock: 50,
      unit: 'gallon',
      isFeatured: true,
      image: 'https://via.placeholder.com/300x200?text=Paint'
    },
    {
      _id: '6',
      name: 'Power Drill',
      category: 'Tools',
      description: 'Professional power drill for construction and DIY projects. High performance and durable.',
      price: 120000,
      stock: 8,
      unit: 'piece',
      image: 'https://via.placeholder.com/300x200?text=Power+Drill'
    }
  ];
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load initial products
  loadProducts();
  
  // Category filter
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }
  
  // Search input
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = e.target.value;
        currentPage = 1;
        loadProducts();
      }, 500);
    });
  }
  
  // Sort filter
  if (sortFilter) {
    sortFilter.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      loadProducts();
    });
  }
  
  // View mode buttons
  if (gridView && listView) {
    gridView.addEventListener('click', () => toggleView('grid'));
    listView.addEventListener('click', () => toggleView('list'));
    
    // Initialize grid view
    toggleView('grid');
  }
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  const search = urlParams.get('search');
  
  if (category) {
    currentCategory = category;
    if (categoryFilter) categoryFilter.value = category;
  }
  
  if (search) {
    currentSearch = search;
    if (searchInput) searchInput.value = search;
  }
});
