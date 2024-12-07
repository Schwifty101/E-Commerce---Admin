import React from 'react';
import UserInfo from '../components/BuyerProfile/UserInfo';
import OrderHistory from '../components/BuyerProfile/OrderHistory';
import '../styling/BuyerProfilePage.css';

export function ProfilePage({ onBack }) {
  return (
    <div className="profile-page">
      <h1 id='profileHeading'>My Profile</h1>
      <button onClick={onBack} className="back-button">Back</button>
      <div className="profile-content">
        <UserInfo />
        <OrderHistory />
      </div>
    </div>
  );
}