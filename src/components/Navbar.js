// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // بررسی ادمین بودن
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };

    getUser();

    // گوش دادن به تغییرات auth
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // دوباره بررسی ادمین
        supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => setIsAdmin(data?.role === 'admin'));
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // اگر صفحه لاگین یا ثبت‌نام هست، Navbar رو نشون نده
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* لوگو و برند */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B2B</span>
              </div>
              <span className="text-gray-800 font-bold text-lg hidden sm:block">B2BSteel</span>
            </Link>
          </div>

          {/* لینک‌های اصلی - دسکتاپ */}
          {user && (
            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              <Link 
                to="/dashboard" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition"
              >
                🏠 داشبورد
              </Link>
              <Link 
                to="/concrete-request" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition"
              >
                🏗️ قالب بتن
              </Link>
              <Link 
                to="/steel-request" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition"
              >
                🏭 سوله
              </Link>
              
              {/* دکمه پنل مدیریت - فقط برای ادمین */}
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition flex items-center"
                >
                  🛠️ پنل مدیریت
                </Link>
              )}
            </div>
          )}

          {/* بخش کاربری - دسکتاپ */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {user ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0] || 'کاربر'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'مدیر سیستم' : 'کاربر عادی'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center"
                >
                  🚪 خروج
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                >
                  ورود
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}

            {/* دکمه منوی موبایل */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <div className="py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500">{isAdmin ? 'مدیر سیستم' : 'کاربر عادی'}</p>
            </div>
            
            <Link 
              to="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 داشبورد
            </Link>
            
            <Link 
              to="/concrete-request" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏗️ درخواست بتن
            </Link>
            
            <Link 
              to="/steel-request" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏭 درخواست سوله
            </Link>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="block px-3 py-2 bg-purple-600 text-white rounded-md text-base font-medium hover:bg-purple-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                🛠️ پنل مدیریت
              </Link>
            )}
            
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2 bg-red-600 text-white rounded-md text-base font-medium hover:bg-red-700"
            >
              🚪 خروج از حساب
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;