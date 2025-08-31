import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, BarChart3, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { AuthManager } from '../utils/security';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Package, current: location.pathname === '/' },
    { name: 'Relatórios', href: '/reports', icon: BarChart3, current: location.pathname === '/reports' }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleSignOut = async () => {
    await AuthManager.signOut();
    setShowUserMenu(false);
  };

  useEffect(() => {
    // Initialize auth and check current user
    const initAuth = async () => {
      await AuthManager.initialize();
      setUser(AuthManager.currentUser);
    };
    
    initAuth();

    // Listen for auth state changes
    const unsubscribe = AuthManager.onAuthStateChange?.((user) => {
      setUser(user);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Reability Logo" 
                className="h-10 w-10 mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Reability
                </h1>
                <p className="text-xs text-gray-600">
                  Gestão Patrimonial
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        item.current
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-sm rounded-full text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <div className="flex items-center px-3 py-2 rounded-md hover:bg-gray-50">
                    <User className="h-4 w-4 mr-2" />
                    <span className="font-medium">
                      {user ? user.email : 'Usuário'}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                        <div className="font-medium">
                          {user ? user.email : 'Não autenticado'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {AuthManager.hasPermission?.('admin') ? 'Administrador' : 'Usuário'}
                        </div>
                      </div>
                      
                      {AuthManager.hasPermission?.('admin') && (
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Shield className="h-4 w-4 mr-2" />
                          Configurações
                        </button>
                      )}
                      
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-gray-200">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                        item.current
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;