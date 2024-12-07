import React, { useState } from 'react';
import logo from '../assets/wolflogo.png';
import walpaper from '../assets/loginWalpaper.png';
import { useNavigate } from 'react-router-dom';

import '../styling/login.css';

function LoginForm({ setCurrentView }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setIsEmailValid(validateEmail(emailValue));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const isFormValid = isEmailValid && password.trim().length > 0;

  const handleLogin = async () => {
    if (isFormValid) {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          alert(data.message || 'Login sucessfull');
          window.location.href = '../../home.html';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        alert('An error occurred during login');
        console.error(error);
      }
    } else {
      alert('Please fill out the form correctly.');
    }
  };

  return (
    <div className="loginDisplay fade-in-right">
      <div className="loginCard">
        <img alt="logo" src={logo} id="logo" />
        <h2 style={{ marginTop: '-10px', fontSize: '2em' }}><b>Login</b></h2>
        <div style={{ marginBottom: '10px' }}>
          <div
            className="emailSection"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
            }}
          >
            <label htmlFor="email" style={{ flexGrow: '1' }}>Email </label>
            <div className="feedback">
              <p style={{ color: isEmailValid ? 'green' : 'red' }}>
                {isEmailValid ? 'Valid Email' : 'Invalid Email Format'}
              </p>
            </div>
          </div>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            style={{ padding: '10px', marginTop: '-20px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            style={{ padding: '10px', marginTop: '10px' }}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={!isFormValid}
          style={{
            padding: '10px 20px',
            backgroundColor: isFormValid ? '#4CAF50' : '#ccc',
            color: '#fff',
            border: 'none',
            cursor: isFormValid ? 'pointer' : 'not-allowed',
          }}
        >
          Login
        </button>
        <button
          onClick={() => setCurrentView('signup')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            marginLeft: '10px',
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
      </div>
      <img src={walpaper} id="walpaper" alt="wallpaper" />
    </div>
  );
}

export default LoginForm;
