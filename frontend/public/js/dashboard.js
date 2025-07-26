// Initialize GSAP
gsap.registerPlugin(ScrollTrigger);

// Dashboard Animations
document.addEventListener('DOMContentLoaded', () => {
    // Animate stats cards
    gsap.from('.stat-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out'
    });

    // Animate main cards
    gsap.from('.card', {
        scrollTrigger: {
            trigger: '.card',
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        duration: 0.6,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: 'power2.out'
    });
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Chart Initialization
const initRevenueChart = () => {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [3000, 3500, 2800, 4100, 3800, 4500],
                borderColor: '#f76d6d',
                backgroundColor: 'rgba(247, 109, 109, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
};

// API Integration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Check Authentication
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return false;
    }
    return token;
};

// API Call Helper
const apiFetch = async (endpoint, options = {}) => {
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
            window.location.href = '/index.html';
            return null;
        }

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showError('An error occurred while fetching data');
        return null;
    }
};

// Fetch all dashboard data
const fetchDashboardData = async () => {
    showLoading(true);
    try {
        const [stats, orders] = await Promise.all([
            apiFetch('/vendor-dashboard/me/stats'),
            apiFetch('/vendor-dashboard/me/orders')
        ]);

        if (stats) updateDashboardStats(stats);
        if (orders) updateRecentOrders(orders);
        showError(null);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError('Failed to fetch dashboard data. Please try again later.');
    } finally {
        showLoading(false);
    }
};

// Update dashboard stats
const updateDashboardStats = (data) => {
    const statsElements = {
        totalOrders: document.getElementById('total-orders'),
        totalRevenue: document.getElementById('total-revenue'),
        avgOrderValue: document.getElementById('avg-order-value'),
        pendingOrders: document.getElementById('pending-orders')
    };

    for (const [key, element] of Object.entries(statsElements)) {
        if (element && data[key]) {
            element.textContent = formatValue(data[key], key);
        }
    }
};

// Format values based on type
const formatValue = (value, type) => {
    if (type.includes('revenue') || type.includes('value')) {
        return `₹${value.toLocaleString()}`;
    }
    return value.toLocaleString();
};

// Remove duplicate initDashboard function (keep the one below with all logic)

// Loading State Management
const showLoading = (show) => {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    loadingOverlay.style.display = show ? 'flex' : 'none';
};

// Error Handling
const showError = (message) => {
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) return;

    if (message) {
        errorContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
        errorContainer.style.display = 'block';
    } else {
        errorContainer.style.display = 'none';
    }
};

// Update Recent Orders Table
const updateRecentOrders = (orders) => {
    const tbody = document.querySelector('#recent-orders-table tbody');
    if (!tbody) return;

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>#${order.id}</td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <span class="status-badge status-${order.status.toLowerCase()}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </td>
            <td class="text-right">${order.items.length}</td>
            <td class="text-right">₹${order.total_amount.toFixed(2)}</td>
        </tr>
    `).join('');

    // Animate new rows
    gsap.from(tbody.querySelectorAll('tr'), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1
    });
};

// Initialize the dashboard
const initDashboard = () => {
    checkAuth(); // Check authentication first
    fetchDashboardData();
    initRevenueChart();
    initTableSearch();
    initTableSort();
};

// Call initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);

// Table Search and Filter
const initTableSearch = () => {
    const searchInput = document.getElementById('table-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tableRows = document.querySelectorAll('tbody tr');

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
};

// Table Sorting
const initTableSort = () => {
    const tableHeaders = document.querySelectorAll('th[data-sort]');
    
    tableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.sort;
            const tbody = header.closest('table').querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                const aVal = a.querySelector(`td[data-${column}]`).textContent;
                const bVal = b.querySelector(`td[data-${column}]`).textContent;
                return aVal.localeCompare(bVal);
            });
            
            if (header.classList.contains('sort-asc')) {
                rows.reverse();
                header.classList.remove('sort-asc');
                header.classList.add('sort-desc');
            } else {
                header.classList.remove('sort-desc');
                header.classList.add('sort-asc');
            }
            
            tbody.append(...rows);
        });
    });
};

// Initialize table functionality
initTableSearch();
initTableSort();
