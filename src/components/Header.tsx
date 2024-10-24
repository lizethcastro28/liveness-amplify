import React from 'react';

interface HeaderProps {
  logoUrl: string;
  text: string;
  color: string;
  location: 'left' | 'center' | 'right';
}

const Header: React.FC<HeaderProps> = ({ logoUrl, text, color, location }) => {
  return (
    <header className="header" style={{ backgroundColor: color }}>
      <div className="header-content" style={{ justifyContent: location }}>
        <img src={logoUrl} alt="Logo" className="header-logo" />
        <span className="header-text" style={{ marginLeft: '10px' }}>{text}</span>
      </div>
    </header>
  );
};

export default Header;
