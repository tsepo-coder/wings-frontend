import React, { useState, useEffect } from 'react';

function UserManagement({ users, setUsers }) {
  const [userForm, setUserForm] = useState({ id: '', name: '', surname: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch users when the component mounts
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data); // Update the users state with fetched data
      } catch (error) {
        setError('Error fetching users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [setUsers]);

  // Handle form submission for creating a new user
  const handleUserSubmit = async (e) => {
    e.preventDefault();

    // Check if required fields are filled
    if (!userForm.name || !userForm.surname || !userForm.email || !userForm.password) {
      setError('Name, Surname, Email, and Password are required.');
      return;
    }

    // Prepare the user data for submission
    const userToSubmit = { 
      name: userForm.name, 
      surname: userForm.surname, 
      email: userForm.email, 
      password: userForm.password 
    };

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToSubmit),
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error('Error registering user');
      }

      // Reset form and show success message
      setUserForm({ name: '', surname: '', email: '', password: '' });
      setError('');
      setSuccessMessage('User registered successfully');
      
      // Refetch users after successful registration to keep the list updated
      const data = await response.json();
      setUsers(prevUsers => [...prevUsers, data.user]);

    } catch (err) {
      setError('Error registering user');
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>User Management</h2>

      {/* Form to add a new user */}
      <form onSubmit={handleUserSubmit}>
        <input
          type="text"
          name="name"
          value={userForm.name}
          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          placeholder="Name"
        />
        <input
          type="text"
          name="surname"
          value={userForm.surname}
          onChange={(e) => setUserForm({ ...userForm, surname: e.target.value })}
          placeholder="Surname"
        />
        <input
          type="email"
          name="email"
          value={userForm.email}
          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={userForm.password}
          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          placeholder="Password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {/* Show error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Show success message */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Display the list of users */}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} {user.surname} - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserManagement;
