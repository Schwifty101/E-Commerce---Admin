import React from 'react';
import { User, Menu , Heart, Package, Bell} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';
import logo from '../../assets/wolflogo.png'
import '../../styling/Header.css'



export function Header({onCartClick, onUserClick, onPackageClick, onSearch}) {
  return (
    <header className="header">
      <div className="container header-content">
        <div className='headerLeft'>
          <div className="header-logo">
            <img src={logo} alt='logo'></img>
          </div>
          <div className='searchBar'>
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
        <div className='headerRight'>
          <div className="header-actions">

          <button className="action-button">
              <Heart className="h-6 w-6" />
            </button>
            <button className="action-button" onClick={onPackageClick}>
              <Package className="h-6 w-6" />
            </button>
            <button className="action-button">
              <Bell className="h-6 w-6" />
            </button>
            <button className="action-button" onClick={onUserClick}>
              <User className="h-6 w-6" />
            </button>
            <CartButton onClick={onCartClick} />
          </div>
        </div>
      </div>
    </header>
  );
}