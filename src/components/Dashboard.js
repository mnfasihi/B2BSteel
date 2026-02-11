// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [concreteRequests, setConcreteRequests] = useState([]);
  const [steelRequests, setSteelRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. دریافت کاربر
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        setUser(user);

        // 2. دریافت پروفایل و بررسی ادمین
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(profile?.role === 'admin');

        // 3. دریافت درخواست‌های بتن
        const { data: concrete } = await supabase
          .from('concrete_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setConcreteRequests(concrete || []);

        // 4. دریافت درخواست‌های سوله
        const { data: steel } = await supabase
          .from('steel_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setSteelRequests(steel || []);

      } catch (error) {
        console.error('خطا:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const totalRequests = concreteRequests.length + steelRequests.length;
  const pendingRequests = 
    concreteRequests.filter(r => r.status === 'pending' || !r.status).length +
    steelRequests.filter(r => r.status === 'pending' || !r.status).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            سلام، {user?.email?.split('@')[0] || 'کاربر'} عزیز
          </h1>
          <p className="text-gray-600 mt-2">به پنل کاربری B2BSteel خوش آمدید</p>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <span className="ml-2">🛠️</span>
              پنل مدیریت
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg ml-4">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">کل درخواست‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg ml-4">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">در انتظار بررسی</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg ml-4">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">تکمیل شده</p>
                <p className="text-2xl font-bold text-gray-900">
                  {concreteRequests.filter(r => r.status === 'completed').length +
                   steelRequests.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">درخواست‌های اخیر</h2>
          
          {totalRequests === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 mb-4">هنوز درخواستی ثبت نکرده‌اید</p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/concrete-request"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ثبت درخواست بتن
                </Link>
                <Link
                  to="/steel-request"
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  ثبت درخواست سوله
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Concrete Requests */}
              {concreteRequests.slice(0, 3).map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">🏗️</span>
                      <div>
                        <h3 className="font-medium text-gray-900">قالب بتن</h3>
                        <p className="text-sm text-gray-500">
                          ابعاد: {request.width || '?'} × {request.length || '?'} × {request.height || '?'} متر
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        در انتظار
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.created_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Steel Requests */}
              {steelRequests.slice(0, 3).map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl ml-3">🏭</span>
                      <div>
                        <h3 className="font-medium text-gray-900">سوله</h3>
                        <p className="text-sm text-gray-500">
                          ابعاد: {request.width || '?'} × {request.length || '?'} متر
                          {request.height && ` × ارتفاع: ${request.height}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        در انتظار
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.created_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {totalRequests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/concrete-request"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg"
            >
              <div className="flex items-center">
                <span className="text-3xl ml-4">🏗️</span>
                <div>
                  <h3 className="text-lg font-bold">درخواست قالب بتن جدید</h3>
                  <p className="text-blue-100">پروژه‌های ساختمانی</p>
                </div>
              </div>
            </Link>
            <Link
              to="/steel-request"
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg"
            >
              <div className="flex items-center">
                <span className="text-3xl ml-4">🏭</span>
                <div>
                  <h3 className="text-lg font-bold">درخواست سوله جدید</h3>
                  <p className="text-yellow-100">سالن‌های صنعتی</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;