// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// State Management
let currentUser = null;
let cartItems = [];
let products = [];
let orders = [];

// Authentication Check
function checkAuth() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('user_type');
    
    if (!token || userType !== 'vendor') {
        window.location.href = '/';
        return false;
    }
    return token;
}

// API Helper
async function apiFetch(endpoint, options = {}) {
    const token = checkAuth();
    if (!token) return null;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_type');
            window.location.href = '/';
            return null;
        }

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Language Toggle
function toggleLanguage() {
    const isHindi = document.getElementById('language-switch').checked;
    localStorage.setItem('language', isHindi ? 'hi' : 'en');
    
    document.querySelectorAll('.lang-en').forEach(el => el.classList.toggle('hidden', isHindi));
    document.querySelectorAll('.lang-hi').forEach(el => el.classList.toggle('hidden', !isHindi));
}

// Tab Management
function showTab(tabName) {
    document.querySelectorAll('[id$="-tab"]').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
}

// Cart Management
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cartItems.forEach(item => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        
        cartItems.innerHTML += `
            <div class="flex justify-between items-center p-2 border-b">
                <div>
                    <h4 class="font-medium">${item.name}</h4>
                    <p class="text-sm text-gray-500">₹${item.price} × ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateCart(${item.id}, ${item.quantity - 1})" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCart(${item.id}, ${item.quantity + 1})" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    cartTotal.textContent = `₹${total.toFixed(2)}`;
    cartCount.textContent = cartItems.length;
}

async function addToCart(productId, quantity = 1) {
    try {
        const response = await apiFetch('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });

        if (response) {
            await fetchCartItems();
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

async function removeFromCart(productId) {
    try {
        await apiFetch(`/cart/remove/${productId}`, {
            method: 'DELETE'
        });
        await fetchCartItems();
        updateCartDisplay();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

async function updateCart(productId, quantity) {
    if (quantity < 1) {
        await removeFromCart(productId);
        return;
    }

    try {
        await apiFetch('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ product_id: productId, quantity })
        });
        await fetchCartItems();
        updateCartDisplay();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// Products Display
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        grid.innerHTML += `
            <div class="bg-white rounded-lg shadow p-4 transition-transform hover:-translate-y-1">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                <h3 class="font-semibold text-lg">${product.name}</h3>
                <p class="text-gray-600 text-sm">${product.description}</p>
                <div class="flex justify-between items-center mt-4">
                    <span class="font-bold text-lg">₹${product.price}</span>
                    <button onclick="addToCart(${product.id})" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// Orders Display
function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        tbody.innerHTML += `
            <tr>
                <td class="px-6 py-4">#${order.id}</td>
                <td class="px-6 py-4">${new Date(order.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}">
                        ${order.status}
                    </span>
                </td>
                <td class="px-6 py-4">₹${order.total_amount}</td>
                <td class="px-6 py-4 text-right">
                    <button onclick="reorderItems(${order.id})" class="text-primary hover:text-indigo-700">
                        <i class="fas fa-redo"></i> Reorder
                    </button>
                </td>
            </tr>
        `;
    });
}

// Checkout Process
async function checkout() {
    try {
        const response = await apiFetch('/orders/create', {
            method: 'POST',
            body: JSON.stringify({
                payment_method: 'cash'  // Default to cash on delivery
            })
        });

        if (response) {
            alert('Order placed successfully!');
            cartItems = [];
            updateCartDisplay();
            toggleCart();
            await fetchOrders();
        }
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('Failed to place order. Please try again.');
    }
}

// Reorder Functionality
async function reorderItems(orderId) {
    try {
        const response = await apiFetch(`/orders/${orderId}/items`);
        if (response) {
            for (const item of response) {
                await addToCart(item.product_id, item.quantity);
            }
            toggleCart();
        }
    } catch (error) {
        console.error('Error reordering items:', error);
    }
}

// Data Fetching
async function fetchUserData() {
    const data = await apiFetch('/users/me');
    if (data) {
        currentUser = data;
        document.getElementById('user-name').textContent = data.full_name;
    }
}

async function fetchProducts() {
    const data = await apiFetch('/products');
    if (data) {
        products = data;
        displayProducts(products);
    }
}

async function fetchOrders() {
    const data = await apiFetch('/orders/me');
    if (data) {
        orders = data;
        displayOrders(orders);
    }
}

async function fetchCartItems() {
    const data = await apiFetch('/cart/items');
    if (data) {
        cartItems = data;
        updateCartDisplay();
    }
}

// Search and Filter
document.getElementById('search-products').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
});

document.getElementById('category-filter').addEventListener('change', (e) => {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const categoryFilter = e.target.value;
    
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filteredProducts);
});

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_type');
    window.location.href = '/';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const token = checkAuth();
    if (token) {
        await Promise.all([
            fetchUserData(),
            fetchProducts(),
            fetchOrders(),
            fetchCartItems()
        ]);
    }
    
    // Set initial language
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'hi') {
        document.getElementById('language-switch').checked = true;
        toggleLanguage();
    }
});
