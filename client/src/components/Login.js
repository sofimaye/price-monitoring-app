import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, password });
            setToken(response.data.token);
            setMessage('Login successful');
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.response?.data?.message || 'Error logging in');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} autoComplete="on">
                <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
