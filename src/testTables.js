// src/testTables.js
import { supabase } from './supabaseClient';

export const testTables = async () => {
  console.log('Testing Supabase tables...');
  
  try {
    // 1. تست جدول concrete_requests
    console.log('1. Testing concrete_requests table...');
    const { data: concreteData, error: concreteError } = await supabase
      .from('concrete_requests')
      .select('count')
      .limit(1);
    
    if (concreteError) {
      console.error('Concrete table error:', concreteError.message);
    } else {
      console.log('Concrete table OK');
    }
    
    // 2. تست جدول steel_requests
    console.log('2. Testing steel_requests table...');
    const { data: steelData, error: steelError } = await supabase
      .from('steel_requests')
      .select('count')
      .limit(1);
    
    if (steelError) {
      console.error('Steel table error:', steelError.message);
    } else {
      console.log('Steel table OK');
    }
    
    // 3. تست ساختار جدول
    console.log('3. Testing table structure...');
    const testUser = {
      user_id: 'test-uuid',
      length: 100,
      width: 50,
      height: 20,
      quantity: 10,
      concrete_type: 'نوع 1',
      reinforcement: 'میلگرد 8',
      surface_finish: 'صیقلی',
      delivery_date: '2024-12-31',
      delivery_address: 'آدرس تست',
      contact_person: 'شخص تست',
      contact_phone: '09123456789'
    };
    
    console.log('Test data structure:', testUser);
    
  } catch (error) {
    console.error('General test error:', error);
  }
};

// در کنسول مرورگر اجرا کنید:
// testTables();