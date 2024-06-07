import React from 'react';
import axios from 'axios';
import '../styles/ProductList.css';

const ProductList = ({ products, token, fetchProducts }) => {
    const deleteProduct = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/delete-product/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchProducts().catch(console.error); // Handle the promise here
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
