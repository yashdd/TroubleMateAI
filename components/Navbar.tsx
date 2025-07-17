import React, { useState } from 'react';
import { Home, MessageCircle, LogIn, UserPlus, Menu, X } from 'lucide-react';
import { useSession } from '@supabase/auth-helpers-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="nav-logo">T</div>
          <span className="nav-title">Troublemate AI</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link"><Home size={18} />Home</a>
          <a href="/chat" className="nav-link"><MessageCircle size={18} />Chat</a>
          
          <a href="/login" className="nav-link"><LogIn size={18} />Login</a>
          <a href="/register" className="nav-link nav-link-primary"><UserPlus size={18} />Register</a>
        
          
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      <div className={`mobile-nav${isOpen ? ' mobile-nav-open' : ''}`}> 
        <a href="#" className="mobile-nav-link"><Home size={18} />Home</a>
        <a href="#" className="mobile-nav-link"><MessageCircle size={18} />Chat</a>
        <a href="#" className="mobile-nav-link"><LogIn size={18} />Login</a>
        <a href="#" className="mobile-nav-link mobile-nav-link-primary"><UserPlus size={18} />Register</a>
      </div>
      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, #3b82f6 0%, #9333ea 100%);
          color: #fff;
          z-index: 1000;
          height: 70px;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #3b82f6, #9333ea);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .nav-title {
          font-size: 1.5rem;
          font-weight: bold;
          background: linear-gradient(45deg, #fff, #e0e7ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e0e7ff;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .nav-link-primary {
          background: linear-gradient(45deg, #fff, #a78bfa);
          color: #3b82f6;
        }
        .nav-link-primary:hover {
          background: linear-gradient(45deg, #e0e7ff, #fff);
          color: #9333ea;
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #e0e7ff;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }
        .mobile-menu-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .mobile-nav {
          display: none;
        }
        @media (max-width: 900px) {
          .nav-links {
            gap: 1rem;
          }
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .mobile-nav {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #3b82f6 0%, #9333ea 100%);
            border-bottom: 1px solid #e0e7ff33;
            padding: 1rem 0;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            z-index: 999;
          }
          .mobile-nav.mobile-nav-open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: #e0e7ff;
            text-decoration: none;
            font-weight: 500;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
            margin-bottom: 0.5rem;
          }
          .mobile-nav-link:last-child {
            margin-bottom: 0;
          }
          .mobile-nav-link:hover {
            color: #fff;
            background: rgba(255,255,255,0.08);
          }
          .mobile-nav-link-primary {
            background: linear-gradient(45deg, #fff, #a78bfa);
            color: #3b82f6;
          }
          .mobile-nav-link-primary:hover {
            background: linear-gradient(45deg, #e0e7ff, #fff);
            color: #9333ea;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar; 