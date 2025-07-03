import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, User, FileText, Home, Sun, Moon, Menu, X, LogIn, Building2, BarChart3 } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const { user, userType, signOut, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const getNavItems = () => {
    const baseItems = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/jobs', label: 'Jobs', icon: Briefcase },
    ]

    if (user) {
      if (userType === 'employer') {
        return [
          ...baseItems,
          { path: '/employer-dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/post-job', label: 'Post Job', icon: Building2 },
          { path: '/profile', label: 'Profile', icon: User },
        ]
      } else {
        return [
          ...baseItems,
          { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
          { path: '/resume', label: 'Resume', icon: FileText },
          { path: '/profile', label: 'Profile', icon: User },
        ]
      }
    }

    return baseItems
  }

  const navItems = getNavItems()

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await signOut()
      setIsMenuOpen(false)
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      // Force navigation to home even if there's an error
      navigate('/')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">SmartApply</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700'
                        : 'text-gray-600 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut || loading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingOut ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing Out...
                      </div>
                    ) : (
                      'Sign Out'
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  disabled={loading}
                  className="ml-2 flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {user ? (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user.user_metadata?.full_name || user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut || loading}
                    className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    {signingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true)
                    setIsMenuOpen(false)
                  }}
                  disabled={loading}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}