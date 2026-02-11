import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://vohwipmyblmvyxiguknv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaHdpcG15Ymxtdnl4aWd1a252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Mjg3MzMsImV4cCI6MjA4NjEwNDczM30.UvOVxq0hX3AWymr_nhTLThH_oAVn3KG05SafOprfs6Q'

// ایجاد supabase client با تنظیمات کامل
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
})

// برای دسترسی در کنسول و کل پروژه
window.supabase = supabase

console.log('✅ Supabase client ready with auth')