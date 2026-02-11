import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function SteelRequestForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOtherPaint, setShowOtherPaint] = useState(false);
  
  // حالت‌های فرم - دقیقاً مطابق ستون‌های جدول
  const [formData, setFormData] = useState({
    // ابعاد سوله - دقیقاً مطابق جدول
    length: '',
    width: '',  
    height: '',
    
    // نقشه سازه
    has_drawing: 'no',
    
    // اطلاعات پروژه - دقیقاً مطابق جدول
    shed_usage: '',
    project_location: '',
    
    // جرثقیل سقفی
    needs_crane: 'no',
    crane_tonnage: '',
    
    // فونداسیون
    foundation: 'no',
    
    // سندبلاست و رنگ
    sandblast: 'no',
    paint_type: '',
    other_paint_type: '', // این تو جدول نیست، بعداً به paint_type تبدیل می‌شه
    paint_thickness: '50',
    
    // مسئولیت‌های خریدار
    responsibility_steel: false,
    responsibility_bolts: false,
    responsibility_transport: false,
    
    // وزن و قیمت
    estimated_weight: '',
    price_type: 'estimated',
    
    // فیلدهای اضافی که تو جدول هستن (اختیاری)
    project_name: '',
    contact_person: '',
    email: '',
    phone: '',
    structure_type: '',
    roof_type: '',
    special_requirements: '',
    delivery_date: ''
  });

  // بارگذاری کاربر
useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // ابتدا سعی کن پروفایل رو با user_id پیدا کنی
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)  // ✅ درست: 'user_id' نه 'id'
        .single();
      
      if (error) {
        console.log('پروفایل پیدا نشد، از اطلاعات کاربر استفاده می‌کنیم:', error.message);
        // اگر پروفایل پیدا نشد، از اطلاعات کاربر استفاده کن
        setFormData(prev => ({
          ...prev,
          contact_person: user.email ? user.email.split('@')[0] : 'کاربر',
          email: user.email || '',
          phone: ''
        }));
      } else if (profile) {
        // اگر پروفایل پیدا شد
        setFormData(prev => ({
          ...prev,
          contact_person: profile.full_name || user.email?.split('@')[0] || 'کاربر',
          email: user.email || '',
          phone: profile.phone || ''
        }));
      }
    }
  };
  
  getUser();
}, []);

  // هندل تغییرات
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // اگر paint_type تغییر کرد، نمایش other رو کنترل کن
      if (name === 'paint_type') {
        setShowOtherPaint(value === 'other');
      }
    }
  };

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      // آماده‌سازی مسئولیت‌های خریدار
      const buyer_responsibilities = [];
      if (formData.responsibility_steel) buyer_responsibilities.push('steel');
      if (formData.responsibility_bolts) buyer_responsibilities.push('bolts');
      if (formData.responsibility_transport) buyer_responsibilities.push('transport');

      // آماده‌سازی داده برای ارسال - دقیقاً مطابق ستون‌های جدول
      const requestData = {
         user_id: user.id,
         buyer_id: user.id,
        // ابعاد
        length: parseFloat(formData.length) || null,
        width: parseFloat(formData.width) || null,
        height: parseFloat(formData.height) || null,
        
        // نقشه
        has_drawing: formData.has_drawing,
        
        // اطلاعات پروژه
        shed_usage: formData.shed_usage,
        project_location: formData.project_location,
        project_name: formData.project_name || `سوله ${formData.length}x${formData.width}`,
        
        // جرثقیل
        needs_crane: formData.needs_crane,
        crane_tonnage: formData.needs_crane === 'yes' ? parseFloat(formData.crane_tonnage) || null : null,
        
        // فونداسیون
        foundation: formData.foundation,
        
        // رنگ
        sandblast: formData.sandblast,
        paint_type: formData.paint_type === 'other' ? formData.other_paint_type : formData.paint_type,
        paint_thickness: parseInt(formData.paint_thickness) || 50,
        
        // مسئولیت‌ها
        buyer_responsibilities: buyer_responsibilities,
        
        // وزن و قیمت
        estimated_weight: formData.estimated_weight ? parseFloat(formData.estimated_weight) : null,
        price_type: formData.price_type,
        
        // اطلاعات تماس
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        
        // فیلدهای اضافی
        structure_type: formData.structure_type || '',
        roof_type: formData.roof_type || '',
        special_requirements: formData.special_requirements || '',
        delivery_date: formData.delivery_date || null,
        
        // وضعیت
        status: 'open',
        created_at: new Date().toISOString()
      };

      console.log('Sending data to Supabase:', requestData);

      // ارسال به Supabase
const { data, error } = await supabase
  .from('steel_requests')
  .insert([requestData]);

if (error) {
  console.error('Supabase error details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
  throw error;
}

      alert('درخواست سوله با موفقیت ثبت شد!');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(`خطا در ثبت درخواست: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // اگر کاربر لاگین نکرده
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">لطفاً ابتدا وارد شوید</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            ورود به حساب کاربری
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            پرسشنامه درخواست سوله نو
          </h1>
          <p className="text-gray-600 text-center mb-6">
            لطفاً اطلاعات پروژه خود را با دقت وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-8">
          
          {/* بخش اطلاعات پروژه */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">اطلاعات پروژه</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">نام پروژه</label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="مثال: سوله انبار شرکت فولاد"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">شخص رابط *</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="نام و نام خانوادگی"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">ایمیل *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">تلفن تماس *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                />
              </div>
            </div>
          </div>

          {/* بخش ابعاد سوله */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">ابعاد سوله *</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">طول (متر)</label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  required
                  min="10"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="مثال: 100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">عرض (متر)</label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  required
                  min="10"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="مثال: 30"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">ارتفاع (متر)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="4"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="مثال: 6"
                />
              </div>
            </div>
          </div>

          {/* بخش اطلاعات فنی */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">اطلاعات فنی</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">کارکرد سوله *</label>
                <textarea
                  name="shed_usage"
                  value={formData.shed_usage}
                  onChange={handleChange}
                  required
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="برای چه منظوری نیاز به سوله دارید؟"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">محل پروژه *</label>
                <input
                  type="text"
                  name="project_location"
                  value={formData.project_location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="استان، شهر، آدرس دقیق"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-4">آیا نقشه سازه دارید؟</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_drawing"
                      value="yes"
                      checked={formData.has_drawing === 'yes'}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 ml-2"
                    />
                    <span>بله</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_drawing"
                      value="no"
                      checked={formData.has_drawing === 'no'}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 ml-2"
                    />
                    <span>خیر</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ادامه فرم... (بقیه بخش‌ها مثل قبل) */}
          {/* بخش جرثقیل */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">جرثقیل سقفی</h2>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="needs_crane"
                  value="yes"
                  checked={formData.needs_crane === 'yes'}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 ml-2"
                />
                <span>نیاز دارم</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="needs_crane"
                  value="no"
                  checked={formData.needs_crane === 'no'}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 ml-2"
                />
                <span>نیاز ندارم</span>
              </label>
            </div>
            
            {formData.needs_crane === 'yes' && (
              <div>
                <label className="block text-gray-700 mb-2">تناژ جرثقیل (تن)</label>
                <input
                  type="number"
                  name="crane_tonnage"
                  value={formData.crane_tonnage}
                  onChange={handleChange}
                  min="1"
                  step="0.5"
                  className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="مثال: 5"
                />
              </div>
            )}
          </div>

          {/* بخش رنگ‌آمیزی */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">رنگ‌آمیزی</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sandblast"
                    value="yes"
                    checked={formData.sandblast === 'yes'}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 ml-2"
                  />
                  <span>سندبلاست نیاز دارم</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sandblast"
                    value="no"
                    checked={formData.sandblast === 'no'}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 ml-2"
                  />
                  <span>سندبلاست نیاز ندارم</span>
                </label>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">نوع رنگ</label>
                <select
                  name="paint_type"
                  value={formData.paint_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">انتخاب کنید</option>
                  <option value="ضد زنگ">ضد زنگ</option>
                  <option value="آلکیدی">آلکیدی</option>
                  <option value="زینک ریچ">زینک ریچ</option>
                  <option value="اپوکسی">اپوکسی</option>
                  <option value="other">سایر</option>
                </select>
                
                {showOtherPaint && (
                  <input
                    type="text"
                    name="other_paint_type"
                    value={formData.other_paint_type}
                    onChange={handleChange}
                    placeholder="نوع رنگ را وارد کنید"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">ضخامت رنگ (میکرون)</label>
                <input
                  type="number"
                  name="paint_thickness"
                  value={formData.paint_thickness}
                  onChange={handleChange}
                  min="20"
                  max="200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="مثال: 50"
                />
              </div>
            </div>
          </div>

          {/* بخش وزن و تحویل */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">وزن و تحویل</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">وزن حدودی (کیلوگرم)</label>
                <input
                  type="number"
                  name="estimated_weight"
                  value={formData.estimated_weight}
                  onChange={handleChange}
                  min="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="مثال: 10000"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">تاریخ تحویل مورد نظر</label>
                <input
                  type="date"
                  name="delivery_date"
                  value={formData.delivery_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* دکمه‌های فرم */}
          <div className="flex gap-4 justify-center pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              بازگشت
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : 'ثبت درخواست'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SteelRequestForm;