import { isSupabaseConfigured, supabase } from './supabase';

type DeleteTableName =
  | 'profiles'
  | 'prospects'
  | 'customer_touches'
  | 'shipment_files'
  | 'route_cards'
  | 'journal_entries'
  | 'agents'
  | 'agent_touches'
  | 'weekly_reviews'
  | 'five_year_roadmap'
  | 'annual_goals'
  | 'quarterly_sprints'
  | 'skill_matrix'
  | 'market_intelligence'
  | 'ai_prompt_library'
  | 'growth_portfolio';

const USER_OWNED_TABLES = new Set<DeleteTableName>([
  'prospects',
  'customer_touches',
  'shipment_files',
  'route_cards',
  'journal_entries',
  'agents',
  'agent_touches',
  'weekly_reviews',
  'five_year_roadmap',
  'annual_goals',
  'quarterly_sprints',
  'skill_matrix',
  'market_intelligence',
  'ai_prompt_library',
  'growth_portfolio',
]);

const LOCAL_TABLE_KEYS: Record<Exclude<DeleteTableName, 'profiles'>, string> = {
  prospects: 'eagles_prospects',
  customer_touches: 'eagles_customer_touches',
  shipment_files: 'eagles_shipment_files',
  route_cards: 'eagles_route_cards',
  journal_entries: 'eagles_journal_entries',
  agents: 'eagles_agents',
  agent_touches: 'eagles_agent_touches',
  weekly_reviews: 'eagles_weekly_reviews',
  five_year_roadmap: 'eagles_five_year_roadmap',
  annual_goals: 'eagles_annual_goals',
  quarterly_sprints: 'eagles_quarterly_sprints',
  skill_matrix: 'eagles_skill_matrix',
  market_intelligence: 'eagles_market_intelligence',
  ai_prompt_library: 'eagles_ai_prompt_library',
  growth_portfolio: 'eagles_growth_portfolio',
};

function assertAllowedTable(tableName: string): asserts tableName is DeleteTableName {
  if (tableName === 'profiles') return;
  if (USER_OWNED_TABLES.has(tableName as DeleteTableName)) return;
  throw new Error(`Delete failed: table "${tableName}" is not approved for client-side deletion.`);
}

function getLocalCurrentUserId(): string | null {
  try {
    const userString = localStorage.getItem('eagles_current_user');
    if (!userString) return null;
    const user = JSON.parse(userString);
    return user?.id || null;
  } catch {
    return null;
  }
}

function deleteLocalRecord(tableName: DeleteTableName, recordId: string) {
  const userId = getLocalCurrentUserId();
  if (!userId) {
    throw new Error('Delete failed: no local logged-in user found.');
  }

  if (tableName === 'profiles') {
    const profiles = JSON.parse(localStorage.getItem('eagles_profile') || '[]');
    const nextProfiles = profiles.filter((row: any) => row.id !== userId && row.user_id !== userId);
    localStorage.setItem('eagles_profile', JSON.stringify(nextProfiles));
    return { success: true, mode: 'local', deletedRows: profiles.length - nextProfiles.length };
  }

  const localKey = LOCAL_TABLE_KEYS[tableName];
  const rows = JSON.parse(localStorage.getItem(localKey) || '[]');
  const nextRows = rows.filter((row: any) => !(row.id === recordId && row.user_id === userId));
  localStorage.setItem(localKey, JSON.stringify(nextRows));

  const deletedRows = rows.length - nextRows.length;
  if (deletedRows === 0) {
    throw new Error('No local row was deleted. Check record id and current user id.');
  }

  return { success: true, mode: 'local', deletedRows };
}

export async function deleteRecord(tableName: string, recordId: string) {
  console.log('deleteRecord invoked', { tableName, recordId });

  if (!tableName) {
    throw new Error('Delete failed: table name is missing.');
  }

  if (!recordId) {
    throw new Error('Delete failed: record id is missing.');
  }

  assertAllowedTable(tableName);

  if (!isSupabaseConfigured || !supabase) {
    return deleteLocalRecord(tableName, recordId);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error('deleteRecord auth error:', userError);
    throw userError;
  }

  if (!user) {
    throw new Error('Delete failed: no logged-in Supabase user found.');
  }

  const query = tableName === 'profiles'
    ? supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
        .select('id')
    : supabase
        .from(tableName)
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id)
        .select('id');

  const { data, error } = await query;

  if (error) {
    console.error('Supabase delete failed', {
      tableName,
      recordId,
      userId: user.id,
      error,
    });
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('No rows deleted.', { tableName, recordId, userId: user.id });
    throw new Error('No row was deleted. Check record id, table name, user_id ownership, and RLS DELETE policy.');
  }

  console.log('Supabase delete success', {
    tableName,
    recordId,
    userId: user.id,
    deletedRows: data.length,
  });

  return {
    success: true,
    mode: 'supabase',
    deletedRows: data.length,
    deletedData: data,
  };
}
