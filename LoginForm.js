import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isRegistering
      ? 'http://localhost:5000/users/register'
      : 'http://localhost:5000/users/login';

    const body = isRegistering
      ? { name, password } // Only name and password for registration
      : { name, password }; // Assuming you want to use name for login as well

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to authenticate, please try again later');
      }

      const data = await response.json();
      console.log(data);

      if (data.success !== undefined && data.success) {
        // Store the JWT token in localStorage or similar handling
        localStorage.setItem('token', data.token);
        onLogin(name, password, isRegistering);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error during login or registration:', error);
      setError(error.message || 'Something went wrong. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={sectionStyle}>
      <div style={formContainerStyle}>
        <h2 style={headingStyle}>{isRegistering ? 'Create an Account' : 'Welcome Back'}</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Loading...' : isRegistering ? 'Register' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={toggleButtonStyle}
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </form>
        {error && <p style={errorStyle}>{error}</p>}
      </div>
    </section>
  );
}

// Inline styles
const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #6bb5ff, #3e3c3b)',
  animation: 'fadeIn 0.5s ease-in-out',
};

const formContainerStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '380px',
  textAlign: 'center',
};

const headingStyle = {
  textAlign: 'center',
  marginBottom: '20px',
  fontSize: '26px',
  fontWeight: 'bold',
  color: '#333',
  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  transition: 'border-color 0.3s, box-shadow 0.3s',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '10px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#4CAF50',
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'background-color 0.3s, transform 0.2s',
};

const toggleButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#007BFF',
};

const errorStyle = {
  color: 'red',
  fontSize: '14px',
  marginTop: '10px',
};

export default LoginForm;