import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddProduct.css';

const AddProduct = ({ token, fetchProducts }) => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/add-product', { url }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Product added successfully');
            fetchProducts().catch(console.error); // Handle the promise here
        } catch (error) {
            setMessage('Error adding product');
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Product URL" required />
                <button type="submit">Add Product</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddProduct;
