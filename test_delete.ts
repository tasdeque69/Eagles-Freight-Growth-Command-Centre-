import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function testDelete() {
  const email = process.env.TEST_DELETE_EMAIL;
  const password = process.env.TEST_DELETE_PASSWORD;

  if (!email || !password) {
    throw new Error('Set TEST_DELETE_EMAIL and TEST_DELETE_PASSWORD in your local .env before running this script. Do not commit real credentials.');
  }

  const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (userError) {
    throw userError;
  }

  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('No signed-in user id returned from Supabase Auth.');
  }

  const { data: insertData, error: insertError } = await supabase
    .from('skill_matrix')
    .insert({
      user_id: userId,
      skill_category: 'Delete Test',
      skill_name: 'Temporary Test Skill',
      maturity_level: 1,
      evidence_link: '',
      improvement_note: 'Temporary delete test record',
      next_action: 'Delete this test row',
      last_reviewed: new Date().toISOString().split('T')[0],
    })
    .select('id');

  if (insertError) {
    throw insertError;
  }

  const id = insertData?.[0]?.id;
  if (!id) {
    throw new Error('Insert did not return a row id.');
  }

  const { data: deleteData, error: deleteError } = await supabase
    .from('skill_matrix')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id');

  if (deleteError) {
    throw deleteError;
  }

  if (!deleteData || deleteData.length === 0) {
    throw new Error('Delete returned zero rows. Check RLS delete policy.');
  }

  console.log('Delete test passed:', deleteData);
}

testDelete().catch((error) => {
  console.error('Delete test failed:', error);
  process.exit(1);
});
