import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { motion } from "framer-motion";
import '../styles/auth.css';
import API_BASE_URL from "../utils/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          throw new Error('Invalid email or password.');
        }
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Expecting { success: true, token: '...' }
      const { token } = data;
      if (!token) throw new Error('Missing token in response');

      // Save token in auth context (and localStorage via AuthProvider)
      login(token);

      // Redirect to prediction page
      navigate('/prediction');

    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the server. Please try again.'
      );
    }
  };

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div 
        className="form-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div 
          className="form-box"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="form-content">
            <motion.h1 
              className="auth-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Welcome Back
            </motion.h1>
            
            <motion.form 
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div 
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
                <i className='bx bxs-envelope input-icon'></i>
              </motion.div>

              <motion.div 
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
                <i className='bx bxs-lock-alt input-icon'></i>
              </motion.div>

              {error && (
                <motion.p 
                  className="error-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <motion.div 
                className="forgot-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <a
                  onClick={() => navigate('/forgot-password')}
                  style={{ cursor: 'pointer' }}
                >
                  Forgot password?
                </a>
              </motion.div>

              <motion.button 
                type="submit" 
                className="auth-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Login
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
