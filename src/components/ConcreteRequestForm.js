// src/components/ConcreteRequestForm.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const ConcreteRequestForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    material: '',
    projectLocation: '',
    deadlineYear: '1404',
    deadlineMonth: '01',
    deadlineDay: '30'
  });
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // لیست اقلام
  const itemsList = [
    { id: 'modular', label: 'قالب مدولار', value: 'مدولار' },
    { id: 'special', label: 'قالب خاص (ویژه)', value: 'خاص' },
    { id: 'tunnelform', label: 'تونلفرم', value: 'تونلفرم' },
    { id: 'scaffolding', label: 'داربست', value: 'داربست' },
    { id: 'caplock', label: 'کاپلاک', value: 'کاپلاک' },
    { id: 'accessories', label: 'ملحقات', value: 'ملحقات' },
    { id: 'round-column', label: 'ستونی گرد', value: 'ستونی گرد' },
    { id: 'sliding', label: 'لغزنده', value: 'لغزنده' },
    { id: 'climbing', label: 'بالارونده', value: 'بالارونده' },
    { id: 'panel', label: 'پنلی', value: 'پنلی' }
  ];
  
  // لیست ماه‌ها
  const persianMonths = [
    { value: '01', label: 'فروردین' },
    { value: '02', label: 'اردیبهشت' },
    { value: '03', label: 'خرداد' },
    { value: '04', label: 'تیر' },
    { value: '05', label: 'مرداد' },
    { value: '06', label: 'شهریور' },
    { value: '07', label: 'مهر' },
    { value: '08', label: 'آبان' },
    { value: '09', label: 'آذر' },
    { value: '10', label: 'دی' },
    { value: '11', label: 'بهمن' },
    { value: '12', label: 'اسفند' }
  ];
  
  // روزها
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleItemToggle = (itemValue) => {
    setSelectedItems(prev => 
      prev.includes(itemValue) 
        ? prev.filter(item => item !== itemValue)
        : [...prev, itemValue]
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      // 1. گرفتن کاربر فعلی
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setMessage('لطفاً ابتدا وارد حساب کاربری خود شوید');
        setLoading(false);
        return;
      }
      
      // 2. ساختن تاریخ شمسی
      const deadlineDate = `${formData.deadlineYear}/${formData.deadlineMonth}/${formData.deadlineDay}`;
      
      // 3. ارسال به دیتابیس
      const { data, error } = await supabase
        .from('concrete_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          items: selectedItems,
          material: formData.material,
          project_location: formData.projectLocation,
          deadline: deadlineDate,
          buyer_id: user.id,
          status: 'open',
          images: [] // فعلاً بدون عکس
        })
        .select(); // این خط داده رو برمی‌گردونه
      
      if (error) {
        console.error('خطای Supabase:', error);
        setMessage(`خطا: ${error.message}`);
        return;
      }
      
      // 4. موفقیت
      setMessage('✅ درخواست با موفقیت ثبت شد!');
      
      // 5. ریست فرم
      setFormData({
        title: '',
        description: '',
        material: '',
        projectLocation: '',
        deadlineYear: '1404',
        deadlineMonth: '01',
        deadlineDay: '30'
      });
      setSelectedItems([]);
      
      console.log('داده ذخیره شد:', data);
      
    } catch (error) {
      console.error('خطا:', error);
      setMessage('خطا در ثبت درخواست');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        فرم درخواست قالب بتن
      </h2>
      
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '25px', borderRadius: '10px' }}>
        
        {/* عنوان */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            عنوان درخواست *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="مثال: قالب مدولار برای پروژه مسکونی ۱۰ طبقه"
          />
        </div>
        
        {/* توضیحات */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            توضیحات *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              resize: 'vertical'
            }}
            placeholder="جزئیات پروژه، ابعاد مورد نیاز، مشخصات فنی..."
          />
        </div>
        
        {/* اقلام */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            اقلام درخواستی *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {itemsList.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id={item.id}
                  checked={selectedItems.includes(item.value)}
                  onChange={() => handleItemToggle(item.value)}
                  style={{ marginLeft: '10px' }}
                />
                <label htmlFor={item.id} style={{ cursor: 'pointer' }}>
                  {item.label}
                </label>
              </div>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3ff', borderRadius: '5px' }}>
              <strong>انتخاب شده: </strong>
              {selectedItems.join('، ')}
            </div>
          )}
        </div>
        
        {/* جنس قالب */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            جنس قالب *
          </label>
          <select
            name="material"
            value={formData.material}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            <option value="">-- انتخاب کنید --</option>
            <option value="ورق رویه فولاد مبارکه">ورق رویه فولاد مبارکه</option>
            <option value="ورق رویه و تسمه های دور فولاد مبارکه">ورق رویه و تسمه‌های دور فولاد مبارکه</option>
            <option value="سایر">سایر</option>
          </select>
        </div>
        
        {/* محل پروژه */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            محل اجرای پروژه *
          </label>
          <input
            type="text"
            name="projectLocation"
            value={formData.projectLocation}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px'
            }}
            placeholder="مثال: تهران، کرج، اصفهان..."
          />
        </div>
        
        {/* تاریخ */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            مهلت ارسال پیشنهاد *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <select
                name="deadlineYear"
                value={formData.deadlineYear}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="1404">۱۴۰۴</option>
                <option value="1405">۱۴۰۵</option>
                <option value="1406">۱۴۰۶</option>
              </select>
            </div>
            
            <div>
              <select
                name="deadlineMonth"
                value={formData.deadlineMonth}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">ماه</option>
                {persianMonths.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                name="deadlineDay"
                value={formData.deadlineDay}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                <option value="">روز</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>
          <p style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
            تاریخ مهلت ارسال پیشنهاد را انتخاب کنید
          </p>
        </div>
        
        {/* دکمه‌ها */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                material: '',
                projectLocation: '',
                deadlineYear: '1404',
                deadlineMonth: '01',
                deadlineDay: '30'
              });
              setSelectedItems([]);
              setMessage('');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            پاک کردن فرم
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              minWidth: '120px'
            }}
          >
            {loading ? 'در حال ثبت...' : 'ثبت درخواست'}
          </button>
        </div>
      </form>
      
      {/* راهنمای تست */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
        <h4 style={{ marginTop: '0', color: '#856404' }}>📝 برای تست:</h4>
        <ol style={{ color: '#856404', paddingRight: '20px' }}>
          <li>فرم رو پر کن</li>
          <li>روی "ثبت درخواست" کلیک کن</li>
          <li>برو به Supabase → Table Editor → concrete_requests</li>
          <li>باید داده جدید رو ببینی</li>
        </ol>
      </div>
    </div>
  );
};

export default ConcreteRequestForm;