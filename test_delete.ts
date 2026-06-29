import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function testDelete() {
  const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
    email: 'hellxtremo@gmail.com',
    password: 'password123'
  });
  
  if (userError) {
    console.error("Auth error:", userError);
    // return;
  }
  
  const userId = userData?.user?.id || 'd3013ba4-9729-4cc1-a8d6-69eb8bd002f2'; // replace with actual if needed
  
  // Insert
  const { data: insertData, error: insertError } = await supabase.from('skill_matrix').insert({
    user_id: userId,
    skill_category: 'Test',
    skill_name: 'Test Skill',
    maturity_level: 1,
    next_action: 'Test',
    last_reviewed: new Date().toISOString().split('T')[0]
  }).select();
  
  console.log("Insert result:", insertData, insertError);
  
  if (insertData && insertData.length > 0) {
    const id = insertData[0].id;
    
    console.log("Deleting id:", id);
    const { data: deleteData, error: deleteError } = await supabase.from('skill_matrix').delete().eq('id', id).eq('user_id', userId).select();
    
    console.log("Delete result:", deleteData, deleteError);
  }
}

testDelete();
