import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const UserRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [shedRequests, setShedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch concrete requests
      const { data: concreteData } = await supabase
        .from('concrete_requests')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch steel requests
      const { data: shedData } = await supabase
        .from('steel_requests')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(concreteData || []);
      setShedRequests(shedData || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'open':
        return { class: 'bg-green-100 text-green-800', text: 'باز' };
      case 'in_progress':
        return { class: 'bg-yellow-100 text-yellow-800', text: 'در حال بررسی' };
      case 'closed':
        return { class: 'bg-gray-100 text-gray-800', text: 'بسته' };
      case 'selected':
        return { class: 'bg-blue-100 text-blue-800', text: 'انتخاب شده' };
      default:
        return { class: 'bg-gray-100 text-gray-800', text: 'بسته' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const filteredRequests = () => {
    if (activeTab === 'concrete') {
      return requests;
    } else if (activeTab === 'shed') {
      return shedRequests;
    } else {
      return [
        ...requests.map(req => ({ ...req, type: 'concrete' })),
        ...shedRequests.map(req => ({ ...req, type: 'shed' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">درخواست‌های من</h1>
          <p className="mt-2 text-gray-600">مدیریت تمام درخواست‌های قالب بتن و سوله</p>
        </div>

        {/* تب‌ها */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'all' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                همه درخواست‌ها
                <span className="bg-gray-100 text-gray-800 text-xs font-medium ml-2 px-2 py-1 rounded-full">
                  {requests.length + shedRequests.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('concrete')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'concrete' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                قالب بتن
                <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2 py-1 rounded-full">
                  {requests.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('shed')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'shed' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                سوله
                <span className="bg-green-100 text-green-800 text-xs font-medium ml-2 px-2 py-1 rounded-full">
                  {shedRequests.length}
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* لیست درخواست‌ها */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests().length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">هیچ درخواستی یافت نشد</h3>
              <p className="mt-2 text-gray-600">
                {activeTab === 'all' 
                  ? 'هنوز درخواستی ثبت نکرده‌اید.' 
                  : activeTab === 'concrete' 
                    ? 'هنوز درخواست قالب بتن ثبت نکرده‌اید.' 
                    : 'هنوز درخواست سوله ثبت نکرده‌اید.'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/concrete-request')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block mr-4"
                >
                  ثبت درخواست قالب بتن
                </button>
                <button
                  onClick={() => navigate('/steel-request')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block"
                >
                  ثبت درخواست سوله
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests().map((request, index) => {
                const statusBadge = getStatusBadge(request.status);
                const isShed = request.type === 'shed' || request.shed_length;
                
                return (
                  <div key={request.id || index} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {isShed 
                              ? `درخواست سوله ${request.shed_length}×${request.shed_width} متر` 
                              : request.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                            {statusBadge.text}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isShed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isShed ? 'سوله' : 'قالب بتن'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {isShed ? request.shed_usage : request.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {isShed ? request.shed_location : request.project_location}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <button
                          onClick={() => navigate(isShed ? `/steel-request/${request.id}` : `/concrete-request/${request.id}`)}
                          className={`text-sm font-medium ${
                            isShed ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          مشاهده جزئیات →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRequests;