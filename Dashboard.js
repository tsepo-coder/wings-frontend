import React, { useState, useEffect } from 'react';

function Dashboard({ lowStockAlert, products, setProducts }) {
  const [isLoading, setIsLoading] = useState(false); // Loading state to handle async fetch
  const [error, setError] = useState(null); // Error state to handle fetch errors

  // Fetch products from the backend
  const fetchProducts = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const response = await fetch('http://localhost:5000/api/products'); // Updated to match API route
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data); // Update global products state
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching product data. Please try again later.');
    } finally {
      setIsLoading(false); // Set loading state to false after request
    }
  };

  // Fetch products only if products are not available or on initial load
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts(); // Fetch products on component mount
    }
  }, [products, setProducts]); // Depend on products and setProducts to avoid unnecessary re-fetch

  return (
    <section id="dashboard">
      <h2>Stock Dashboard</h2>
      
      {/* Show low stock alert if there are products with low stock */}
      {lowStockAlert.length > 0 && (
        <div id="lowStockAlert" style={alertStyle}>
          {lowStockAlert.map((product) => (
            <p key={product.id}>Product "{product.name}" is low on stock!</p>
          ))}
        </div>
      )}

      {/* Show error message if fetching products fails */}
      {error && <div style={errorStyle}>{error}</div>}

      {/* Show loading state when products are being fetched */}
      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <h3>Product List</h3>
          <table id="productTable" style={tableStyle}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Price (M)</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5">No products available</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.category}</td>
                    <td>M {parseFloat(product.price).toFixed(2)}</td>
                    <td>{product.quantity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

// Inline styles for error display and table
const errorStyle = {
  color: 'red',
  fontSize: '16px',
  marginTop: '20px',
  textAlign: 'center',
};

const alertStyle = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

export default Dashboard;
