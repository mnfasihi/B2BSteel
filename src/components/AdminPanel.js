// src/components/admin/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [concreteRequests, setConcreteRequests] = useState([]);
  const [steelRequests, setSteelRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);

  // بررسی دسترسی ادمین
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // ۱. دریافت کاربر جاری
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/login');
          return;
        }
        
        setCurrentUser(user);

        // ۲. بررسی نقش ادمین
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('خطا در دریافت پروفایل:', profileError);
          navigate('/dashboard');
          return;
        }

        // ۳. اگر ادمین نیست، برگرد به داشبورد
        if (profile?.role !== 'admin') {
          alert('⚠️ دسترسی محدود! فقط مدیران سیستم می‌توانند وارد پنل مدیریت شوند.');
          navigate('/dashboard');
          return;
        }

        // ۴. اگر ادمین است، داده‌ها را بارگذاری کن
        await loadAllData();
        
      } catch (error) {
        console.error('خطا در بررسی دسترسی:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // بارگذاری همه داده‌ها
  const loadAllData = async () => {
    try {
      // بارگذاری موازی همه داده‌ها
      const [usersResponse, concreteResponse, steelResponse] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('concrete_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('steel_requests').select('*').order('created_at', { ascending: false })
      ]);

      if (usersResponse.data) setUsers(usersResponse.data);
      if (concreteResponse.data) setConcreteRequests(concreteResponse.data);
      if (steelResponse.data) setSteelRequests(steelResponse.data);

    } catch (error) {
      console.error('خطا در بارگذاری داده‌ها:', error);
    }
  };

  // آمار کلی
  const stats = {
    totalUsers: users.length,
    totalConcreteRequests: concreteRequests.length,
    totalSteelRequests: steelRequests.length,
    pendingConcrete: concreteRequests.filter(r => r.status === 'pending' || !r.status).length,
    pendingSteel: steelRequests.filter(r => r.status === 'pending' || !r.status).length,
    completedRequests: concreteRequests.filter(r => r.status === 'completed').length + 
                      steelRequests.filter(r => r.status === 'completed').length
  };

  // تغییر وضعیت درخواست
  const updateRequestStatus = async (type, id, newStatus) => {
    try {
      const table = type === 'concrete' ? 'concrete_requests' : 'steel_requests';
      
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // رفرش داده‌ها
      await loadAllData();
      alert('✅ وضعیت با موفقیت به روز شد!');
      
    } catch (error) {
      console.error('خطا در به‌روزرسانی وضعیت:', error);
      alert('❌ خطا در به‌روزرسانی وضعیت');
    }
  };

  // خروج از سیستم
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // صفحه‌بندی
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بررسی دسترسی‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر پنل مدیریت */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 پنل مدیریت B2BSteel</h1>
              <p className="text-gray-600 text-sm mt-1">
                مدیریت کاربران و درخواست‌ها
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                ← بازگشت به داشبورد
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                خروج از سیستم
              </button>
            </div>
          </div>

          {/* تب‌های ناوبری */}
          <div className="mt-6 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              📊 آمار کلی
            </button>
            <button
              onClick={() => setActiveTab('concrete')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'concrete' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🏗️ درخواست‌های بتن
            </button>
            <button
              onClick={() => setActiveTab('steel')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'steel' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              🏭 درخواست‌های سوله
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              👥 مدیریت کاربران
            </button>
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* تب آمار کلی */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">📊 آمار کلی سیستم</h2>
            
            {/* کارت‌های آمار */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg ml-4">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">کل کاربران</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg ml-4">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">کل درخواست‌ها</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalConcreteRequests + stats.totalSteelRequests}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg ml-4">
                    <span className="text-xl">⏳</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">در انتظار بررسی</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingConcrete + stats.pendingSteel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg ml-4">
                    <span className="text-xl">✅</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">تکمیل شده</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.completedRequests}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* خلاصه */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">📈 خلاصه فعالیت</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">درخواست‌های بتن</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>کل درخواست‌ها:</span>
                      <span className="font-bold">{stats.totalConcreteRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>در انتظار:</span>
                      <span className="text-yellow-600 font-bold">{stats.pendingConcrete}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-2">درخواست‌های سوله</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>کل درخواست‌ها:</span>
                      <span className="font-bold">{stats.totalSteelRequests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>در انتظار:</span>
                      <span className="text-yellow-600 font-bold">{stats.pendingSteel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تب درخواست‌های بتن */}
        {activeTab === 'concrete' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">🏗️ درخواست‌های قالب بتن ({concreteRequests.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right text-gray-700 font-medium">کاربر</th>
                    <th className="p-3 text-right text-gray-700 font-medium">ابعاد</th>
                    <th className="p-3 text-right text-gray-700 font-medium">محل پروژه</th>
                    <th className="p-3 text-right text-gray-700 font-medium">تاریخ</th>
                    <th className="p-3 text-right text-gray-700 font-medium">وضعیت</th>
                    <th className="p-3 text-right text-gray-700 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {concreteRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        🏗️ هنوز درخواست بتنی ثبت نشده است
                      </td>
                    </tr>
                  ) : (
                    concreteRequests.map(request => (
                      <tr key={request.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{request.contact_person || 'بدون نام'}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </td>
                        <td className="p-3">
                          {request.width} × {request.length} × {request.height} متر
                        </td>
                        <td className="p-3">{request.project_location || '-'}</td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={request.status || 'pending'}
                            onChange={(e) => updateRequestStatus('concrete', request.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">در انتظار</option>
                            <option value="approved">تایید شده</option>
                            <option value="rejected">رد شده</option>
                            <option value="completed">تکمیل شده</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تب درخواست‌های سوله */}
        {activeTab === 'steel' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">🏭 درخواست‌های سوله ({steelRequests.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right text-gray-700 font-medium">کاربر</th>
                    <th className="p-3 text-right text-gray-700 font-medium">ابعاد</th>
                    <th className="p-3 text-right text-gray-700 font-medium">کاربرد</th>
                    <th className="p-3 text-right text-gray-700 font-medium">تاریخ</th>
                    <th className="p-3 text-right text-gray-700 font-medium">وضعیت</th>
                    <th className="p-3 text-right text-gray-700 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {steelRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        🏭 هنوز درخواست سوله ثبت نشده است
                      </td>
                    </tr>
                  ) : (
                    steelRequests.map(request => (
                      <tr key={request.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{request.contact_person || 'بدون نام'}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </td>
                        <td className="p-3">
                          {request.width} × {request.length} متر
                          {request.height && ` (ارتفاع: ${request.height} متر)`}
                        </td>
                        <td className="p-3">{request.shed_usage || '-'}</td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={request.status || 'pending'}
                            onChange={(e) => updateRequestStatus('steel', request.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="pending">در انتظار</option>
                            <option value="approved">تایید شده</option>
                            <option value="rejected">رد شده</option>
                            <option value="completed">تکمیل شده</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تب مدیریت کاربران */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">👥 مدیریت کاربران ({users.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-right text-gray-700 font-medium">نام کامل</th>
                    <th className="p-3 text-right text-gray-700 font-medium">ایمیل</th>
                    <th className="p-3 text-right text-gray-700 font-medium">تلفن</th>
                    <th className="p-3 text-right text-gray-700 font-medium">نقش</th>
                    <th className="p-3 text-right text-gray-700 font-medium">تاریخ عضویت</th>
                    <th className="p-3 text-right text-gray-700 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        👤 هنوز کاربری ثبت نشده است
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{user.full_name || 'بدون نام'}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.phone || '-'}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'مدیر سیستم' : 'کاربر عادی'}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              if (window.confirm(`آیا می‌خواهید نقش ${user.email} را تغییر دهید؟`)) {
                                // TODO: تابع تغییر نقش
                              }
                            }}
                            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                          >
                            تغییر نقش
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// تابع کمکی برای رنگ وضعیت
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'approved': return 'bg-blue-100 text-blue-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

// تابع کمکی برای متن وضعیت
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'در انتظار';
    case 'approved': return 'تایید شده';
    case 'rejected': return 'رد شده';
    case 'completed': return 'تکمیل شده';
    default: return 'در انتظار';
  }
};

export default AdminPanel;