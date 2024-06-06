import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import './styles/App.css';


const App = () => {
  const [token, setToken] = useState('');

  if (!token) {
    return (
        <div className="main-container">
          <Register />
          <Login setToken={setToken} />
        </div>
    );
  }

  return (
      <div>
        <AddProduct token={token} />
        <ProductList token={token} />
      </div>
  );
};

export default App;
