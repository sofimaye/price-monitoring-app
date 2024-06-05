const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch and parse product info from a product URL
const fetchProductInfo = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extract price from HTML using the provided selector
        const priceString = $('.price-box .special-price .price .price').text(); // Using the given selector
        const price = parseFloat(priceString.replace(/\s/g, '').replace('грн', '').replace('&nbsp;', '').trim());

        // Extract product name using the correct selector
        const brand = $('span.h1-brand').text().trim();
        const name = $('span.h1-name').text().trim();
        const productName = `${brand} ${name}`;

        return { price, productName };
    } catch (error) {
        console.error('Error fetching or parsing product info:', error);
        return null;
    }
};

// Add a Product using url from the website to the MongoDb Atlas cluster
const addProduct = async () => {
    const url = 'https://aromateque.com.ua/ua/dior-miss-dior-blooming-bouquet-spray-old-20768';
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
