import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      backgroundColor: '#1a1a2e',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ color: '#e94560', fontSize: '20px', fontWeight: 700 }}>
          ⚡ IMS
        </span>
        <span style={{ color: '#fff', fontSize: '14px', marginLeft: '8px' }}>
          Incident Management System
        </span>
      </Link>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          backgroundColor: '#00ff88',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ color: '#aaa', fontSize: '13px' }}>Live</span>
      </div>
    </nav>
  );
};

export default Navbar;
