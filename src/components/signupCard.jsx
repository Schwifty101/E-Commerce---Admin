import React, { useState } from 'react';
import logo from '../assets/wolflogo.png';
import walpaper from '../assets/signUpWalpaper.png';
import { useNavigate } from 'react-router-dom';

import '../styling/login.css';

function SignUpForm({onJoinNow}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Function to validate password
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  // Function to validate phone (Pakistani format)
  const validatePhone = (phone) => {
    const phoneRegex = /^03\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setIsEmailValid(validateEmail(emailValue));
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setIsPasswordValid(validatePassword(passwordValue));
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;
    setPhone(phoneValue);
    setIsPhoneValid(validatePhone(phoneValue));
  };

  // Check if the sign-up button should be enabled
  const isFormValid = isEmailValid && isPasswordValid && isPhoneValid;
  const handleSignUp = async () => {
    if (isFormValid) {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/users/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            phone,
            role: 'buyer', // default role
            name: email.split('@')[0], // using email username as name for now
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          alert('Sign-up successful! Please login.');
          navigate('/login');
        } else {
          alert(data.message || 'Signup failed');
        }
      } catch (error) {
        alert('An error occurred during signup');
        console.error(error);
      }
    } else {
      alert('Please fill out the form correctly.');
    }
  };

  return (
    <div className="loginDisplay fade-in-right">
      <img src={walpaper} id="walpaper" alt="wallpaper" />

      <div className="signCard">
        <img alt="logo" src={logo} id="logo" />

        <h2 style={{ marginTop: '-10px', fontSize: '2em' }}><b>Sign Up</b></h2>
        
        {/* Email Section */}
        <div style={{ marginBottom: '10px' }}>
          <div
            className="emailSection"
            style={{
              display: 'flex',
              flexDirection: 'column',
              
            }}
          >
            <label htmlFor="email" style={{ flexGrow: '1' }}>Email</label>
           

          </div>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            style={{ padding: '10px', marginTop: '-20px' }}
          />
                      <div className="feedback">
              <p style={{ color: isEmailValid ? 'green' : 'red' }}>
                {isEmailValid ? 'Valid Email' : 'Invalid Email Format'}
              </p>
            </div>
        </div>

        {/* Password Section */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            style={{ padding: '10px', marginTop: '10px' }}
          />
          <p style={{ color: isPasswordValid ? 'green' : 'red', marginTop: '5px' }}>
            {isPasswordValid
              ? 'Strong Password'
              : 'Password must be at least 8 characters long, include a special character and a number'}
          </p>
        </div>

        {/* Phone Section */}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="phone">Phone Number</label>
          <br />
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            style={{ padding: '10px', marginTop: '10px' }}
          />
          <p style={{ color: isPhoneValid ? 'green' : 'red', marginTop: '5px' }}>
            {isPhoneValid
              ? 'Valid Phone Number'
              : 'Phone number must follow the Pakistani format (e.g., 03XXXXXXXXX)'}
          </p>
        </div>

       
        <button
          onClick={handleSignUp}
          disabled={!isFormValid}
          style={{
            padding: '10px 20px',
            backgroundColor: isFormValid ? '#4CAF50' : '#ccc',
            color: '#fff',
            border: 'none',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            marginLeft: '10px',
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default SignUpForm;
