'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, ShoppingCart, X } from 'lucide-react'; // Removed User import
import Image from "next/image";
import Link from 'next/link';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(true);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Fixed NodeJS type
  const [cartCount, setCartCount] = useState(0);

  const hideNavbar = useCallback(() => {
    setIsNavbarVisible(false);
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/itemsInCart');
      const data = await response.json();
      if (data.success) {
        setCartCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Fetch cart count and set up listeners
  useEffect(() => {
    fetchCartCount();

    // Set up event listeners for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    // Listen for both add and remove events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartItemRemoved', handleCartUpdate);
    window.addEventListener('cartQuantityChanged', handleCartUpdate);

    // Optional: Set up polling to update cart count periodically
    const interval = setInterval(fetchCartCount, 30000);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartItemRemoved', handleCartUpdate);
      window.removeEventListener('cartQuantityChanged', handleCartUpdate);
      clearInterval(interval);
    };
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
    { name: 'SHOP', href: '/shop' },
    { name: 'ABOUT US', href: '/aboutUs' },
    { name: 'CONTACT', href: '/contact' },
    { name: 'STUDIO', href: '/studio' },
    { name: 'ORDER', href: '/order' },
    { name: 'PROFILE', href: '/profile' }
  ];

  const CartIcon = () => (
    <div className=" h-[80%] w-24 flex justify-center items-center relative">
      <Link href="/cart">
        <div className="relative">
          <ShoppingCart 
            className={`
              ${isTransparent ? 'text-foreground/75' : 'text-foreground/75'}
            `} 
          />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cartCount}
            </span>
          )}
        </div>
      </Link>
    </div>
  );

  return (
    <nav 
      className={`w-full
        fixed top-0 left-0 z-50 
        transition-all duration-300 ease-in-out  bg-background 
        ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}
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
      <div className='px-2 sm:px-12 py-4 '>
      {/* Large Screen Navigation */}
      <div className="hidden bg-background  lg:flex items-center justify-between">
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
                ${isTransparent ? 'text-foreground/75' : 'text-foreground/75'} 
                tracking-wider
                hover:underline
                text-lg 
              `}
            >
              {link.name}
            </a>
          ))}
          <CartIcon />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden  h-[50px] flex items-center justify-between">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`${isTransparent ? 'text-black' : 'text-black'}`}
        >
          <Menu className="h-6 w-6" />
        </button>

        <Link href='/' className='flex items-center h-full'>
          <Image 
            src="/images/IMG_2320.png" 
            alt="Logo" 
            width={50}
            height={50}
            className="h-8  w-auto absolute left-1/2 transform -translate-x-1/2"
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
                  className="text-foreground "
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
};

export default NavBar;