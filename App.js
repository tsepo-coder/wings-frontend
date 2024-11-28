import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import './App.css';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';

function App() {
  const [products, setProducts] = useState([]); // Initializing with empty array
  const [users, setUsers] = useState([]); // Initializing with empty array
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('currentUser') || null); // Persistent user session (localStorage)
  const [loginError, setLoginError] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState([]);

  // Fetch data for products and users when the component mounts
  useEffect(() => {
    if (currentUser) {
      fetchProducts();
      fetchUsers();
      checkLowStock();
    }
  }, [currentUser]);

  // Fetch products from the backend
  const fetchProducts = () => {
    fetch('http://localhost:5000/products') // Replace with your backend URL
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        checkLowStock(data); // Recheck low stock after fetching
      })
      .catch(error => console.error('Error fetching products:', error));
  };

  // Fetch users from the backend
  const fetchUsers = () => {
    fetch('http://localhost:5000/users') // Replace with your backend URL
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      })
      .catch(error => console.error('Error fetching users:', error));
  };

  const handleLoginOrRegister = (username, password, isRegistering) => {
    if (isRegistering) {
      const existingUser = users.find(u => u.username === username);
      if (existingUser) {
        setLoginError('Username already exists. Please login.');
      } else {
        const newUser = { username, password };
        fetch('http://localhost:5000/users/add', { // POST to your backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        })
          .then(response => response.json())
          .then(data => {
            setUsers([...users, newUser]);
            setCurrentUser(username); // Set user as logged in
            localStorage.setItem('currentUser', username); // Save to localStorage
            setLoginError('');
          })
          .catch(error => console.error('Error adding user:', error));
      }
    } else {
      // Check login credentials with backend
      fetch('http://localhost:5000/users/login', { // POST request for login
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setCurrentUser(username); // Set the current user after successful login
            localStorage.setItem('currentUser', username); // Persist user session
            setLoginError('');
          } else {
            setLoginError('Incorrect username or password.');
          }
        })
        .catch(error => {
          setLoginError('Error during login. Please try again.');
          console.error('Error during login:', error);
        });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null); // Remove user from the session
    localStorage.removeItem('currentUser'); // Remove from localStorage
  };

  // Function to check low stock products
  const checkLowStock = (products = []) => {
    setLowStockAlert(products.filter(product => product.quantity < 10));
  };

  return (
    <Router>
      <div className="App">
        <header>
          {/* Replaced <marquee> with a <div> that uses CSS for scrolling */}
          <div className="scrolling-text">
            <h1>===== STOCK INVENTORY SYSTEM =====</h1>
          </div>
          
          {currentUser && (
            <nav>
              <Link to="/dashboard">Dashboard</Link> | 
              <Link to="/product-management">Product Management</Link> | 
              <Link to="/user-management">User Management</Link>
            </nav>
          )}
          {currentUser && (
            <div id="userStatus">
              <p id="loggedInUser">Logged in as: {currentUser}</p>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </header>

        <Routes>
          {/* If the user is not logged in, they are redirected to login */}
          <Route 
            path="/" 
            element={!currentUser ? <LoginForm onLogin={handleLoginOrRegister} loginError={loginError} /> : <Navigate to="/dashboard" />} 
          />
          {/* Protect dashboard and other routes */}
          <Route 
            path="/dashboard" 
            element={currentUser ? <Dashboard products={products} lowStockAlert={lowStockAlert} setProducts={setProducts} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/user-management" 
            element={currentUser ? <UserManagement users={users} setUsers={setUsers} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/product-management" 
            element={currentUser ? <ProductManagement products={products} setProducts={setProducts} checkLowStock={checkLowStock} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
