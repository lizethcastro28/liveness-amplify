import React from 'react';

interface FooterProps {
  text: string;
  color: string;
  location: 'left' | 'center' | 'right';
}

const Footer: React.FC<FooterProps> = ({ text, color, location }) => {
  return (
    <footer className="footer" style={{ backgroundColor: color }}>
      <div className="footer-content" style={{ justifyContent: location }}>
        <span className="footer-text">{text}</span> {/* Añadir clase para estilos */}
      </div>
    </footer>
  );
};

export default Footer;
