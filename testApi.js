const axios = require('axios');
const fetchProductInfo = require('./fetchProductInfo');

// Add a Product using URL from the website to the MongoDB Atlas cluster
const addProduct = async () => {
    const url = 'https://aromateque.com.ua/ua/dior-capture-youth-eye-treatment';
    const productInfo = await fetchProductInfo(url);

    if (!productInfo) {
        console.error('Failed to fetch product information');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3001/api/add-product', {
            user_email: 'sofi.mann99@gmail.com',
            url: url,
            current_price: productInfo.price
        });
        console.log('Add Product Response:', response.data);
    } catch (error) {
        console.error('Error adding product:', error.response ? error.response.data : error.message);
    }
};

// Fetch All Products
const fetchProducts = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/products');
        console.log('Fetch Products Response:', response.data);
    } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
    }
};

// Delete a Product
const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(`http://localhost:3001/api/delete-product/${productId}`);
        console.log('Delete Product Response:', response.data);
    } catch (error) {
        console.error('Error deleting product:', error.response ? error.response.data : error.message);
    }
};

// Trigger Price Check
const checkPrices = async () => {
    try {
        const response = await axios.get('http://localhost:3001/api/check-prices');
        console.log('Check Prices Response:', response.data);
        if (response.data.changedProducts && response.data.changedProducts.length > 0) {
            console.log('Changed Products:', response.data.changedProducts);
        } else {
            console.log('No price changes detected.');
        }
    } catch (error) {
        console.error('Error checking prices:', error.response ? error.response.data : error.message);
    }
};

// Uncomment the function you want to test

addProduct();
// fetchProducts();
// deleteProduct('666018196eaeebbddb6b38af');
// checkPrices();
