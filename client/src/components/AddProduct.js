import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddProduct.css';


const AddProduct = ({ token }) => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/add-product', { url }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Product added successfully');
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
