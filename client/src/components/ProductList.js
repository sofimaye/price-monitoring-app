import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ProductList.css';


const ProductList = ({ token }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
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

        fetchProducts();
    }, [token]);

    const deleteProduct = async (id) => {
        try {
            await axios.delete(`/api/delete-product/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setProducts(products.filter((product) => product._id !== id));
        } catch (error) {
            console.error('Error deleting product', error);
        }
    };

    return (
        <div className="product-list-container">
            <h2>Product List</h2>
            <ul>
                {products.map((product) => (
                    <li key={product._id}>
                        {product.product_name} - {product.current_price}
                        <button onClick={() => deleteProduct(product._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
