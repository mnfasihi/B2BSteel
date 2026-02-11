// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ session }) => {
  return (
    <div className="min-h-screen">
      {/* هیرو */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            سیستم مدیریت درخواست‌های ساختمانی
          </h1>
          <p className="text-xl mb-10 opacity-90">
            سامانه‌ای یکپارچه برای مدیریت درخواست‌های قالب بتن و سازه‌های فلزی
          </p>
          
          {!session ? (
            <div className="space-x-4">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-100 transition"
              >
                شروع کنید
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-white/10 transition"
              >
                ورود
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-bold hover:bg-gray-100 transition"
            >
              رفتن به داشبورد
            </Link>
          )}
        </div>
      </div>

      {/* ویژگی‌ها */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">
            امکانات سیستم
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold mb-3">درخواست قالب بتن</h3>
              <p className="text-gray-600">
                ثبت و پیگیری درخواست‌های قالب بتن با مشخصات فنی کامل
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-bold mb-3">درخواست سوله</h3>
              <p className="text-gray-600">
                مدیریت درخواست‌های سازه‌های فلزی و سوله
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg border">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">پنل مدیریت</h3>
              <p className="text-gray-600">
                نظارت و مدیریت کامل بر تمام درخواست‌های سیستم
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;