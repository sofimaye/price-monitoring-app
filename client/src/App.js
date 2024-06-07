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

    useEffect(() => {
        if (token) {
            fetchProducts().catch(console.error); // Handle the promise here
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products', error);
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
            <AddProduct token={token} fetchProducts={fetchProducts} />
            <ProductList products={products} token={token} fetchProducts={fetchProducts} />
        </div>
    );
};

export default App;
