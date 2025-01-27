'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, UploadIcon, X } from 'lucide-react'; // Removed User import
import Image from "next/image";
import Link from 'next/link';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(true);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Fixed NodeJS typ

  const hideNavbar = useCallback(() => {
    setIsNavbarVisible(false);
  }, []);

  useEffect(() => {
    const checkScrollPosition = () => {
      const currentScrollY = window.scrollY;
  
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
  
      setIsTransparent(currentScrollY === 0);
  
      if (currentScrollY === 0) {
        setIsNavbarVisible(true);
        return;
      }
  
      setIsNavbarVisible(true);
  
      scrollTimerRef.current = setTimeout(hideNavbar, 1000);
    };
  
    const initialTimer = setTimeout(() => {
      if (window.scrollY > 0) {
        setIsNavbarVisible(false);
      }
    }, 1000);
  
    window.addEventListener('scroll', checkScrollPosition);
  
    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      clearTimeout(initialTimer);
    };
  }, [hideNavbar]);

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'About Us', href: '/aboutUs' },
    { name: 'Contact', href: '/contact' },
    { name: 'Our Studio', href: '/studio' },
    { name: 'Orders', href: '/admin_orders' },
    { name: 'Search', href: '/query_orders' },
    { name: 'Profile', href: '/profile' }
  ];

  const CartIcon = () => (
    <div className="lg:border lg:border-white h-[80%] w-24 flex justify-center items-center relative">
      <Link href="/upload">
        <div className="relative">
          <UploadIcon 
            className={`
              h-8 w-8 
              ${isTransparent ? 'text-white' : 'text-white'}
            `} 
          />
        </div>
      </Link>
    </div>
  );

  return (
    <nav 
      className={`
        w-full px-12 py-4 fixed top-0 left-0 z-50 
        transition-all duration-300 ease-in-out
        ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isTransparent ? 'bg-transparent' : 'bg-customText'}  
        ${isTransparent ? '' : 'bg-opacity-60'}
      `}
      onMouseEnter={() => {
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current);
        }
        setIsNavbarVisible(true);
      }}
      onMouseLeave={() => {
        if (window.scrollY > 0) {
          scrollTimerRef.current = setTimeout(hideNavbar, 1000);
        }
      }}
    >
      {/* Large Screen Navigation */}
      <div className="hidden lg:flex items-center justify-between">
        <Link href="/">
          <div className="flex-shrink-0">
            <Image 
              src="/images/IMG_2320.png" 
              alt="Logo" 
              width={80}
              height={80}
              className="h-20 w-auto cursor-pointer"
            />
          </div>
        </Link>

        <div className="flex items-center h-20 space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className={`
                ${isTransparent ? 'text-white' : 'text-white'} 
                text-lg font-semibold transition-colors
              `}
            >
              {link.name}
            </a>
          ))}
          <CartIcon />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden h-[50px] flex items-center justify-between">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`${isTransparent ? 'text-white' : 'text-white'}`}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href='/'>
          <Image 
            src="/images/IMG_2320.png" 
            alt="Logo" 
            width={50}
            height={100}
            className="h-8 w-auto absolute left-1/2 transform -translate-x-1/2"
          />
        </Link>

        <div className=" h-[80%] w-16 flex justify-center items-center">
          <CartIcon />
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 pt-20">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-white"
            >
              <X className="h-6 w-6 text-black" />
            </button>
            <div className="flex flex-col p-6 bg-white space-y-12">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="text-black text-2xl font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;