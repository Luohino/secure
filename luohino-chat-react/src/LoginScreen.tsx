import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (user: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const VALID_PASSWORDS = [
    'a1n2i3k4e5t6',
    'l1u2o3h4i5n6o7',
    't1a2n3a4y5a6',
    'd1e2m3o4u5s6e7r8',
  ];

  const handleUserSelect = (selectedUser: string) => {
    setUser(selectedUser);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if (VALID_PASSWORDS.includes(password)) {
      onLogin(user);
    } else {
      alert('Invalid password!');
    }
  };

  const handleQuickPassword = (quickPassword: string) => {
    setPassword(quickPassword);
  };

  return (
    <div id="loginScreen" className="container">
      <h1>Luohino Chat</h1>
      <h2>Select User</h2>

      <div className="user-selection">
        <button
          className={`user-option ${user === 'Luohino' ? 'selected' : ''}`}
          onClick={() => handleUserSelect('Luohino')}
        >
          Luohino
        </button>
        <button
          className={`user-option ${user === 'Tanaya' ? 'selected' : ''}`}
          onClick={() => handleUserSelect('Tanaya')}
        >
          Tanaya
        </button>
      </div>

      <div className="password-container">
        <input
          type="password"
          id="passwordInput"
          placeholder="Enter password"
          maxLength={20}
          value={password}
          onChange={handlePasswordChange}
        />
        <button className="password-toggle" id="passwordToggle" type="button">
          👁
        </button>
      </div>

      <div className="quick-passwords">
        <div className="quick-password-label">Quick Login:</div>
        <div className="password-buttons">
          <button
            className="password-btn"
            onClick={() => handleQuickPassword('a1n2i3k4e5t6')}
          >
            a1n2i3k4e5t6
          </button>
          <button
            className="password-btn"
            onClick={() => handleQuickPassword('l1u2o3h4i5n6o7')}
          >
            l1u2o3h4i5n6o7
          </button>
          <button
            className="password-btn"
            onClick={() => handleQuickPassword('t1a2n3a4y5a6')}
          >
            t1a2n3a4y5a6
          </button>
          <button
            className="password-btn"
            onClick={() => handleQuickPassword('d1e2m3o4u5s6e7r8')}
          >
            1e2m3o4u5s6e7r8
          </button>
        </div>
      </div>

      <button
        className="btn"
        id="loginBtn"
        disabled={!user || !password}
        onClick={handleLogin}
      >
        Login
      </button>

      <div className="encryption-badge">Made by Luohino</div>
    </div>
  );
};

export default LoginScreen;