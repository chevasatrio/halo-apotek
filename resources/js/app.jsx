console.log('🔥🔥🔥 APP.JSX IS LOADING 🔥🔥🔥');
import React from 'react';
import { createRoot } from 'react-dom/client';
import ProductsList from './components/ProductsList.jsx';
import CartManager from './components/CartManager.js';
import LocationTracker from './components/LocationTracker.js';

// Initialize React components when DOM is ready
console.log('🚀 React App Initializing...');
console.log('📦 Products Data:', window.productsData);

// Products List
const productsContainer = document.getElementById('products-container');
if (productsContainer) {
    const productsData = window.productsData || [];
    console.log('✅ Products Container Found');
    console.log('📊 Products Count:', productsData.length);

    try {
        const root = createRoot(productsContainer);
        root.render(React.createElement(ProductsList, { products: productsData }));
        console.log('✅ React ProductsList Rendered Successfully');
    } catch (error) {
        console.error('❌ Error Rendering ProductsList:', error);
    }
} else {
    console.warn('⚠️ Products Container Not Found');
}

// Cart Manager
try {
    const cartManager = new CartManager();
    window.cartManager = cartManager;
    console.log('✅ CartManager Initialized');
    console.log('🛒 Cart Manager:', cartManager);
} catch (error) {
    console.error('❌ Error Initializing CartManager:', error);
}

// Location Tracker
try {
    const locationTracker = new LocationTracker();
    window.locationTracker = locationTracker;
    console.log('✅ LocationTracker Initialized');
    console.log('📍 Location Tracker:', locationTracker);
} catch (error) {
    console.error('❌ Error Initializing LocationTracker:', error);
}

// Setup event listeners
const cartBtn = document.getElementById('cartBtn');
const locationBtn = document.getElementById('locationBtn');

if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        console.log('🛒 Cart Button Clicked');
        if (window.cartManager) {
            window.cartManager.showCart();
        } else {
            console.error('❌ CartManager not available');
        }
    });
    console.log('✅ Cart Button Event Listener Added');
} else {
    console.warn('⚠️ Cart Button Not Found');
}

if (locationBtn) {
    locationBtn.addEventListener('click', () => {
        console.log('📍 Location Button Clicked');
        if (window.locationTracker) {
            window.locationTracker.showLocation();
        } else {
            console.error('❌ LocationTracker not available');
        }
    });
    console.log('✅ Location Button Event Listener Added');
} else {
    console.warn('⚠️ Location Button Not Found');
}

// Update cart badge
if (window.cartManager) {
    window.cartManager.updateCartBadge();
}

console.log('✅ All Components Initialized Successfully!');
console.log('💡 You can test in console:');
console.log('   - window.cartManager.showCart()');
console.log('   - window.locationTracker.showLocation()');
console.log('   - window.productsData');

