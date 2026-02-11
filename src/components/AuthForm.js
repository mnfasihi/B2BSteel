import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthForm = ({ onSuccess, mode = 'login' }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'buyer',
    sellerType: 'formwork',
    companyName: '',
    contactPerson: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      
      if (onSuccess) onSuccess(data.user);
      
    } catch (error) {
      setError(`خطا در ورود: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // اعتبارسنجی
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      setLoading(false);
      return;
    }
    
    try {
      // 1. ثبت‌نام در auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: formData.userType,
            company_name: formData.companyName,
            contact_person: formData.contactPerson
          }
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // 2. ایجاد رکورد در جدول users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: formData.email,
            user_type: formData.userType,
            seller_type: formData.userType === 'seller' ? formData.sellerType : null,
            company_name: formData.companyName,
            contact_person: formData.contactPerson,
            phone: formData.phone,
            verification_status: 'pending',
            is_admin: false
          });
        
        if (userError) throw userError;
        
        if (onSuccess) onSuccess(authData.user);
      }
      
    } catch (error) {
      setError(`خطا در ثبت‌نام: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '30px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
        {mode === 'login' ? 'ورود به حساب' : 'ثبت‌نام در B2BSteel'}
      </h2>
      
      {error && (
        <div style={{
          padding: '12px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
        {/* ایمیل */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            ایمیل *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="example@email.com"
          />
        </div>
        
        {/* رمز عبور */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            رمز عبور *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="حداقل ۶ کاراکتر"
          />
        </div>
        
        {mode === 'register' && (
          <>
            {/* تکرار رمز عبور */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                تکرار رمز عبور *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            {/* نوع کاربر */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                نوع حساب *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name="userType"
                    value="buyer"
                    checked={formData.userType === 'buyer'}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  خریدار
                </label>
                <label style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name="userType"
                    value="seller"
                    checked={formData.userType === 'seller'}
                    onChange={handleInputChange}
                    style={{ marginLeft: '8px' }}
                  />
                  فروشنده
                </label>
              </div>
            </div>
            
            {/* نوع فروشنده */}
            {formData.userType === 'seller' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  نوع فروشندگی *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="sellerType"
                      value="formwork"
                      checked={formData.sellerType === 'formwork'}
                      onChange={handleInputChange}
                      style={{ marginLeft: '8px' }}
                    />
                    قالب بتن
                  </label>
                  <label style={{ flex: 1 }}>
                    <input
                      type="radio"
                      name="sellerType"
                      value="shed"
                      checked={formData.sellerType === 'shed'}
                      onChange={handleInputChange}
                      style={{ marginLeft: '8px' }}
                    />
                    سوله
                  </label>
                </div>
              </div>
            )}
            
            {/* نام شرکت */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                نام شرکت (اختیاری)
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="نام شرکت یا سازمان"
              />
            </div>
            
            {/* نام شخص رابط */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                نام شخص رابط *
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="نام و نام خانوادگی"
              />
            </div>
            
            {/* تلفن */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                تلفن تماس (اختیاری)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="09121234567"
              />
            </div>
          </>
        )}
        
        {/* دکمه‌ها */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? '#ccc' : '#2ecc71',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'در حال پردازش...' : (mode === 'login' ? 'ورود' : 'ثبت‌نام')}
          </button>
        </div>
      </form>
      
      {/* لینک تغییر حالت */}
      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
        {mode === 'login' ? (
          <p>
            حساب ندارید؟{' '}
            <button
              type="button"
              onClick={() => window.location.href = '/register'}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '16px'
              }}
            >
              ثبت‌نام کنید
            </button>
          </p>
        ) : (
          <p>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '16px'
              }}
            >
              وارد شوید
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;