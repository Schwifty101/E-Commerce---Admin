import React, { useState, useEffect } from 'react';
import UserInfoForm from './UserInfoForm';

function UserInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const { data } = await response.json();
      setUserData(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching profile:', error);
    }
  };

  // Handle profile updates
  const handleUpdateInfo = async (newInfo) => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/users/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newInfo.name,
          email: newInfo.email,
          phone: newInfo.phone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const { data } = await response.json();
      setUserData(data);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
      console.error('Error updating profile:', error);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-info-section">
      <div className="section-header">
        <h2>Personal Information</h2>
        <button 
          className="edit-button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <UserInfoForm 
          initialData={userData} 
          onSubmit={handleUpdateInfo} 
        />
      ) : (
        <div className="info-display">
          <InfoField label="Name" value={userData.name} />
          <InfoField label="Email" value={userData.email} />
          <InfoField label="Phone" value={userData.phone} />
          <InfoField label="Address" value={userData.address} />
        </div>
      )}
    </div>
  );
}

const InfoField = ({ label, value }) => (
  <div className="info-item">
    <label>{label}:</label>
    <span>{value}</span>
  </div>
);

export default UserInfo;