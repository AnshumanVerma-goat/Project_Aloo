// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// State Management
let currentPage = 1;
let totalPages = 1;
let products = [];
let filters = {
    search: '',
    category: '',
    status: ''
};

// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// DOM Elements
const productsContainer = document.getElementById('products-container');
const productTemplate = document.getElementById('product-card-template');
const searchInput = document.getElementById('product-search');
const categoryFilter = document.getElementById('category-filter');
const statusFilter = document.getElementById('status-filter');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumbers = document.getElementById('page-numbers');

// Fetch Products
async function fetchProducts() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage.toString(),
            search: filters.search,
            category: filters.category,
            status: filters.status
        });

        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
        const data = await response.json();
        
        products = data.items;
        totalPages = Math.ceil(data.total / data.per_page);
        
        renderProducts();
        updatePagination();
    } catch (error) {
        console.error('Error fetching products:', error);
        showError('Failed to load products. Please try again later.');
    }
}

// Render Products
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = productTemplate.content.cloneNode(true);
        
        // Set product details
        productCard.querySelector('.product-image img').src = product.image_url;
        productCard.querySelector('.product-status').textContent = product.status;
        productCard.querySelector('.product-status').classList.add(product.status.toLowerCase());
        productCard.querySelector('.product-name').textContent = product.name;
        productCard.querySelector('.product-price').textContent = `₹${product.price.toFixed(2)}`;
        productCard.querySelector('.product-stock').textContent = `Stock: ${product.stock}`;
        
        // Add event listeners
        const editBtn = productCard.querySelector('.edit-btn');
        const deleteBtn = productCard.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editProduct(product.id));
        deleteBtn.addEventListener('click', () => deleteProduct(product.id));
        
        // Animate product card
        const card = productCard.querySelector('.product-card');
        gsap.from(card, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            scrollTrigger: {
                trigger: card,
                start: 'top bottom-=100',
                toggleActions: 'play none none reverse'
            }
        });
        
        productsContainer.appendChild(productCard);
    });
}

// Update Pagination
function updatePagination() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    pageNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-number');
        if (i === currentPage) pageBtn.classList.add('active');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            fetchProducts();
        });
        pageNumbers.appendChild(pageBtn);
    }
}

// Edit Product
async function editProduct(productId) {
    window.location.href = `/products/edit/${productId}`;
}

// Delete Product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        fetchProducts();
        showSuccess('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product. Please try again.');
    }
}

// Show Error Message
function showError(message) {
    // Implement error notification
    console.error(message);
}

// Show Success Message
function showSuccess(message) {
    // Implement success notification
    console.log(message);
}

// Event Listeners
searchInput.addEventListener('input', debounce(() => {
    filters.search = searchInput.value;
    currentPage = 1;
    fetchProducts();
}, 300));

categoryFilter.addEventListener('change', () => {
    filters.category = categoryFilter.value;
    currentPage = 1;
    fetchProducts();
});

statusFilter.addEventListener('change', () => {
    filters.status = statusFilter.value;
    currentPage = 1;
    fetchProducts();
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchProducts();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchProducts();
    }
});

// Debounce Helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});
