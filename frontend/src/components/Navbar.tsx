"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Package, MapPin, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleAction = (path: string) => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(path);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Schools', href: '/schools' },
    { name: 'All Uniforms', href: '/catalog' },
    { name: 'Track Order', href: '/orders' },
  ];

  return (
    <nav className="bg-[#080808] sticky top-0 z-50 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-white text-2xl font-bold tracking-tighter">
            Uniformly
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-white text-sm font-semibold hover:text-gray-300 transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Cart */}
            <Link href="/cart" className="text-white relative hover:text-gray-300 transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e63946] text-white text-[10px] font-bold h-4.5 min-w-4.5 flex items-center justify-center rounded-full px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="text-white flex items-center gap-1 hover:text-gray-300 transition-colors"
                >
                  <User size={22} />
                  <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-4 w-72 bg-[#eef1f3] rounded-b-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-gray-200">
                      <div className="font-bold text-lg text-[#111111]">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-[#555555]">{user.email}</div>
                    </div>
                    <div className="py-2">
                      <button onClick={() => handleAction('/profile')} className="w-full flex items-center gap-4 px-5 py-4 text-[#111111] font-medium hover:bg-gray-200 transition-colors">
                        <User size={18} /> My Profile
                      </button>
                      <button onClick={() => handleAction('/orders')} className="w-full flex items-center gap-4 px-5 py-4 text-[#111111] font-medium hover:bg-gray-200 transition-colors">
                        <Package size={18} /> My Orders
                      </button>
                      <button onClick={() => handleAction('/address')} className="w-full flex items-center gap-4 px-5 py-4 text-[#111111] font-medium hover:bg-gray-200 transition-colors border-b border-gray-200 mb-2">
                        <MapPin size={18} /> My Address
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 text-red-600 font-medium hover:bg-red-50 transition-colors">
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/register" className="bg-white text-[#080808] px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                Login/Signup
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <Link href="/cart" className="text-white relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#e63946] text-white text-[10px] font-bold h-4 min-w-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={toggleMobileMenu} className="text-white">
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#080808] border-t border-gray-800 p-6 space-y-6 animate-in fade-in slide-in-from-top-5">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white text-lg font-semibold"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <div className="h-px bg-gray-800 my-4" />
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-semibold">My Profile</Link>
              <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-semibold">My Orders</Link>
              <button onClick={handleLogout} className="block text-red-500 text-lg font-semibold">Logout</button>
            </>
          ) : (
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="block bg-white text-[#080808] text-center py-3 rounded-xl font-bold"
            >
              Login/Signup
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
