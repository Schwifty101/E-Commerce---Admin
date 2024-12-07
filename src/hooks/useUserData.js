import { useState, useEffect } from 'react';

const initialUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  address: '123 Main St, City, Country'
};

export function useUserData() {
  const [userData, setUserData] = useState(initialUserData);

  const updateUserData = async (newData) => {
    try {
      // Here you would typically make an API call to update the user data
      setUserData(newData);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  return { userData, updateUserData };
}