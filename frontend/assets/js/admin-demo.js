// Demo Admin Login for KRISHNI ENTERPRISES
// This bypasses database for quick testing

// Override the login function for demo
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Demo credentials
      if (username === 'admin' && password === 'admin123') {
        // Show success and redirect to dashboard
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Logging in...';
        
        setTimeout(() => {
          // Hide login and show dashboard
          document.getElementById('loginSection').classList.add('hidden');
          document.getElementById('dashboardSection').classList.remove('hidden');
          
          // Set user display
          document.getElementById('userDisplay').textContent = 'Admin';
          
          // Load demo data
          loadDemoData();
        }, 1000);
        
      } else {
        loginError.textContent = 'Invalid credentials. Use: admin / admin123';
        loginError.classList.remove('hidden');
      }
    });
  }
});

// Load demo data for dashboard
function loadDemoData() {
  // Demo products
  const demoProducts = [
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
      name: 'Galvanized Iron Sheets',
      category: 'Iron Sheets',
      price: 45000,
      stock: 75,
      unit: 'piece',
      isFeatured: false,
      image: 'https://via.placeholder.com/100x100?text=Iron'
    },
    {
      _id: '3',
      name: 'PVC Pipes',
      category: 'Plumbing',
      price: 15000,
      stock: 200,
      unit: 'meter',
      isFeatured: true,
      image: 'https://via.placeholder.com/100x100?text=PVC'
    }
  ];
  
  // Demo contacts
  const demoContacts = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+256772123456',
      subject: 'Product Inquiry',
      status: 'pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+256755987654',
      subject: 'Price Quote',
      status: 'in-progress',
      createdAt: new Date().toISOString()
    }
  ];
  
  // Update stats
  document.getElementById('totalProducts').textContent = demoProducts.length;
  document.getElementById('featuredProducts').textContent = demoProducts.filter(p => p.isFeatured).length;
  document.getElementById('lowStock').textContent = demoProducts.filter(p => p.stock <= 10).length;
  document.getElementById('pendingContacts').textContent = demoContacts.filter(c => c.status === 'pending').length;
  
  // Display products table
  const productsTable = document.getElementById('productsTable');
  if (productsTable) {
    productsTable.innerHTML = demoProducts.map(product => `
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
          <button onclick="alert('Edit product: ${product.name}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="alert('Delete product: ${product.name}')" class="text-red-600 hover:text-red-900">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
  
  // Display contacts table
  const contactsTable = document.getElementById('contactsTable');
  if (contactsTable) {
    contactsTable.innerHTML = demoContacts.map(contact => `
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
          <button onclick="alert('View contact: ${contact.name}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="alert('Update status for: ${contact.name}')" class="text-green-600 hover:text-green-900">
            <i class="fas fa-check"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }
}

// Logout function
function logout() {
  document.getElementById('loginSection').classList.remove('hidden');
  document.getElementById('dashboardSection').classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}
