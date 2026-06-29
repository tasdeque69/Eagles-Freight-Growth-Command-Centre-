import { supabase } from './supabase';

export async function deleteRecord(tableName: string, recordId: string): Promise<any> {
  console.log("deleteRecord invoked", { tableName, recordId });
  
  if (!tableName) {
    console.error("deleteRecord error: Missing table name");
    throw new Error("Missing table name");
  }
  if (!recordId) {
    console.error("deleteRecord error: Missing record id");
    throw new Error("Missing record id");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("deleteRecord auth error:", userError);
    throw userError;
  }

  const user = userData?.user;
  if (!user) {
    console.error("deleteRecord error: User is not logged in");
    throw new Error("User is not logged in");
  }

  console.log("deleteRecord: user identified", { userId: user.id });

  let query;
  if (tableName === 'profiles') {
    query = supabase
      .from("profiles")
      .delete()
      .eq("id", user.id)
      .select();
  } else {
    query = supabase
      .from(tableName)
      .delete()
      .eq("id", recordId)
      .eq("user_id", user.id)
      .select();
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase delete failed", { tableName, recordId, userId: user.id, error });
    throw error;
  }

  console.log("Supabase delete success", { tableName, recordId, userId: user.id, deletedRows: data });

  if (!data || data.length === 0) {
    console.warn("No rows deleted. Check record id, table name, and RLS policy.", { tableName, recordId, userId: user.id });
    throw new Error("No row was deleted. Check record id, table name, and RLS policy.");
  }

  return data;
}
