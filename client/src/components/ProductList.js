import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ProductList.css';

const ProductList = ({ token, products, setProducts }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/api/notifications', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications().catch(console.error); // Handle the promise here
        const intervalId = setInterval(() => fetchNotifications().catch(console.error), 300000); // 5 minutes interval
        return () => clearInterval(intervalId);
    }, [token]);

    const handleDelete = async (productId) => {
        try {
            await axios.delete(`/api/delete-product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter(product => product._id !== productId));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="product-list-container">
            <h2>Product List</h2>
            {products.map(product => (
                <div key={product._id} className="product-item">
                    <p>{product.product_name}</p>
                    <p>Current Price: {product.current_price}</p>
                    <p>Last Checked: {new Date(product.last_checked).toLocaleString()}</p>
                    <button onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
            ))}
            {notifications.length > 0 && (
                <div className="notifications">
                    <h3>Notifications</h3>
                    {notifications.map((notification, index) => (
                        <div key={index} className="notification-item">
                            <p>{notification.message}</p>
                            <p>Date: {new Date(notification.date).toLocaleString()}</p>
                            <p>Product: {products.find(p => p._id === notification.product_id)?.product_name || 'Unknown'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
