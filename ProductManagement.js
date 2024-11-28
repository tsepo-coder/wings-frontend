import React, { useState, useEffect, useCallback } from 'react';

function ProductManagement({ products, setProducts, checkLowStock }) {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: ''
  });

  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);  // Added loading state
  const [error, setError] = useState('');  // Error state

  // Fetch products function is wrapped in useCallback to avoid unnecessary re-renders
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Failed to load products.');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [setProducts]);

  // Fetch products once when the component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add New Product
  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      const data = await response.json();
      setProducts(prevProducts => [...prevProducts, { ...newProduct, id: data.productId }]);
      setNewProduct({ name: '', description: '', category: '', price: '', quantity: '' });
      checkLowStock();  // Check if any stock is low
    } catch (error) {
      setError('Error adding product.');
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update Product
  const handleUpdateProduct = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingProduct),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      setProducts(prevProducts =>
        prevProducts.map(product => product.id === id ? editingProduct : product)
      );
      setEditingProduct(null);
      checkLowStock();  // Recheck stock after updating
    } catch (error) {
      setError('Error updating product.');
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    setLoading(true);
    try {
      await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
      });
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      checkLowStock();  // Recheck stock after deleting
    } catch (error) {
      setError('Error deleting product.');
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="productManagement">
      <h3>Product Management</h3>

      {/* Display Error if any */}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Loading Indicator */}
      {loading && <div>Loading...</div>}

      {/* Add New Product Form */}
      <h4>Add New Product</h4>
      <input
        type="text"
        placeholder="Product Name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Description"
        value={newProduct.description}
        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
      />
      <input
        type="text"
        placeholder="Category"
        value={newProduct.category}
        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={newProduct.quantity}
        onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
      />
      <button onClick={handleAddProduct}>Add Product</button>

      {/* Display Products */}
      <h4>Existing Products</h4>
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.category}</td>
              <td>{parseFloat(product.price).toFixed(2)}</td>
              <td>{product.quantity}</td>
              <td>
                <button onClick={() => setEditingProduct(product)}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagement;
