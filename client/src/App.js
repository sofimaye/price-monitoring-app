import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import './styles/App.css';

const App = () => {
    const [token, setToken] = useState('');
    const [products, setProducts] = useState([]);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (token) {
            fetchProducts().catch(console.error); // Handle the promise here
        }
    }, [token]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchAndCheckProducts().catch(console.error); // Handle the promise here
        }, 300000); // 5 minutes

        return () => clearInterval(intervalId);
    }, [token]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const fetchAndCheckProducts = async () => {
        await fetchProducts();
        await checkPriceChanges();
    };

    const checkPriceChanges = async () => {
        try {
            const response = await axios.get('/api/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const notifications = response.data;
            if (notifications.length > 0) {
                setNotification(notifications[0]);
            }
        } catch (error) {
            console.error('Error checking price changes', error);
        }
    };

    if (!token) {
        return (
            <div className="main-container">
                <Register />
                <Login setToken={setToken} />
            </div>
        );
    }

    return (
        <div className="add-prod-show-list">
            {notification && (
                <div className="notification">
                    <p>{notification.message}</p>
                </div>
            )}
            <AddProduct token={token} fetchProducts={fetchProducts} />
            <ProductList token={token} products={products} setProducts={setProducts} />
        </div>
    );
};

export default App;
