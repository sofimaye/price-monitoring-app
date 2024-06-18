import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 5 || password.length > 10) {
            setMessage('Password must be between 5 and 10 characters long');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/register', { email, password });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error registering');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
