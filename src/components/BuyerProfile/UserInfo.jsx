import React, { useState } from 'react';
import UserInfoForm from './UserInfoForm';
import { useUserData } from '../../hooks/useUserData';

function UserInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const { userData, updateUserData } = useUserData();

  const handleUpdateInfo = (newInfo) => {
    updateUserData(newInfo);
    setIsEditing(false);
  };

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