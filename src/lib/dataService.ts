import { supabase, isSupabaseConfigured } from './supabase';
import { deleteRecord as centralDeleteRecord } from './deleteRecord';
import { 
  Profile, 
  Prospect, 
  CustomerTouch, 
  ShipmentFile, 
  RouteCard, 
  JournalEntry, 
  Agent, 
  AgentTouch, 
  WeeklyReview,
  DailyKPIData,
  WeeklyKPIData
} from '../types';

// Helper to get local date string YYYY-MM-DD
export function getLocalDateString(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - (offset * 60 * 1000));
  return local.toISOString().split('T')[0];
}

// Helper to find the Sunday date of the current week (tracking Sunday to Thursday)
export function getWeekStartAndEnd(dateInput: Date | string = new Date()): { start: string; end: string } {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Find Sunday (start of week)
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  
  // Thursday of this week
  const thursday = new Date(sunday);
  thursday.setDate(sunday.getDate() + 4);

  return {
    start: getLocalDateString(sunday),
    end: getLocalDateString(thursday)
  };
}

// Generate UUID for fallback local database
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// --- LOCAL STORAGE DATA ENGINE ---
const LOCAL_KEYS = {
  CURRENT_USER: 'eagles_current_user',
  ALL_USERS: 'eagles_all_users',
  PROFILE: 'eagles_profile',
  PROSPECTS: 'eagles_prospects',
  TOUCHES: 'eagles_customer_touches',
  SHIPMENTS: 'eagles_shipment_files',
  ROUTES: 'eagles_route_cards',
  JOURNALS: 'eagles_journal_entries',
  AGENTS: 'eagles_agents',
  AGENT_TOUCHES: 'eagles_agent_touches',
  REVIEWS: 'eagles_weekly_reviews'
};

// Initial data seeder for local mode so that it doesn't look empty when they first run it
function getLocalItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seed helper
export async function seedMockData(userId: string) {
  if (isSupabaseConfigured && supabase) {
    // Check if user already has prospects in Supabase
    const { data: existingProspects, error } = await supabase
      .from('prospects')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (!error && existingProspects && existingProspects.length === 0) {
      const today = getLocalDateString();
      
      const initialProspects = [
        {
          user_id: userId,
          company_name: 'Apex Manufacturing Solutions',
          location: 'Shanghai, China',
          product_type: 'Industrial Machinery Parts',
          export_market: 'Europe (Germany/Netherlands)',
          commercial_contact_person: 'Mr. Zhang Wei',
          phone_or_email: 'zhang.wei@apex-mfg.cn',
          possible_shipment_route: 'Shanghai (PVG) to Frankfurt (FRA) - Air Freight',
          possible_pain_point: 'High transit times on rail and high air rates with current carrier',
          next_action: 'Send trial quote for 3 CBM express shipment next Tuesday',
          status: 'Contacted',
          follow_up_date: today,
          notes: 'Very interested in our airline contract rates. Needs backup support.',
          created_at: new Date().toISOString()
        },
        {
          user_id: userId,
          company_name: 'Bavarian Auto Components',
          location: 'Munich, Germany',
          product_type: 'Automotive Accessories',
          export_market: 'Asia (China/Vietnam)',
          commercial_contact_person: 'Dieter Mueller',
          phone_or_email: 'dieter.mueller@bavaria-auto.de',
          possible_shipment_route: 'Hamburg (HAM) to Ningbo (NGB) - Ocean FCL',
          possible_pain_point: 'Space constraints during peak shipping weeks and poor communication.',
          next_action: 'Arrange virtual meeting to present route schedule options',
          status: 'Negotiating',
          follow_up_date: today,
          notes: 'Needs premium space guarantee.',
          created_at: new Date().toISOString()
        },
        {
          user_id: userId,
          company_name: 'Zenith Tech Logistics',
          location: 'Guangzhou, China',
          product_type: 'Electronics & Wearables',
          export_market: 'Global',
          commercial_contact_person: 'Ms. Helen Lee',
          phone_or_email: 'helen.lee@zenithtech.com',
          possible_shipment_route: 'Shenzhen (SZX) to London (LHR) - Air',
          possible_pain_point: 'Frequent delays at transshipment points.',
          next_action: 'Study direct air route options and draft Route Card',
          status: 'New',
          follow_up_date: today,
          notes: 'First touch completed.',
          created_at: new Date().toISOString()
        }
      ];
      
      const { data: insertedProspects } = await supabase.from('prospects').insert(initialProspects).select();

      if (insertedProspects && insertedProspects.length > 0) {
        const initialTouches = [
          {
            user_id: userId,
            prospect_id: insertedProspects[0].id,
            touch_type: 'Trial quotation request',
            date: today,
            message_summary: 'Sent immediate quotation for Frankfurt route with space protection option.',
            response_status: 'Pending review',
            next_action: 'Call on Wednesday morning to follow up on the rate',
            follow_up_date: today,
            trial_quote_asked: true,
            created_at: new Date().toISOString()
          }
        ];
        await supabase.from('customer_touches').insert(initialTouches);
      }

      const initialRoutes = [
        {
          user_id: userId,
          origin: 'PVG (Shanghai)',
          destination: 'FRA (Frankfurt)',
          mode: 'Air',
          carrier_or_airline: 'Lufthansa Cargo (LH)',
          transit_time: '1-2 Days',
          transshipment_point: 'Direct',
          common_cargo_type: 'Li-Battery Electronics & High-Value Parts',
          common_issue: 'Strict battery MSDS screening causing customs delays at PVG',
          agent_role: 'Eagles Germany agent acts as custom clearance coordinator at FRA',
          customer_objection: 'Rates are $0.40/kg higher than indirect carriers',
          possible_solution: 'Emphasize the 48-hour delivery speed guarantee vs 5-7 days indirect',
          created_at: new Date().toISOString()
        }
      ];
      await supabase.from('route_cards').insert(initialRoutes);

      const initialShipments = [
        {
          user_id: userId,
          date: today,
          shipment_route: 'Ningbo (NGB) to Rotterdam (RTM)',
          mode: 'Ocean',
          customer_requirement: '40ft HC with strict 28-day transit limit for autumn inventory',
          booking_status: 'Confirmed with Maersk',
          document_status: 'Draft BL Approved',
          cut_off_date: today,
          cargo_handover_status: 'Containers entered port terminal',
          problem_or_delay: 'Port congestion at Rotterdam causing possible 3-day terminal delay',
          solution_taken: 'Coordinated with Europe agent to pre-clear customs and pre-book haulage',
          key_learning: 'Always secure carrier haulage 7 days prior to vessel arrival during congestion peaks',
          created_at: new Date().toISOString()
        }
      ];
      await supabase.from('shipment_files').insert(initialShipments);

      const initialJournal = {
        user_id: userId,
        date: today,
        key_learnings: 'Clients prioritize space guarantees over slight rate differences during peak season.',
        challenges_faced: 'Securing backup space out of PVG.',
        action_plan_tomorrow: 'Follow up on the trial quote for Apex.',
        created_at: new Date().toISOString()
      };
      await supabase.from('journal_entries').insert([initialJournal]);
    }
    return;
  }

  const prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, []);
  if (prospects.length === 0) {
    const today = getLocalDateString();
    const yesterday = getLocalDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    const initialProspects: Prospect[] = [
      {
        id: generateUUID(),
        user_id: userId,
        company_name: 'Apex Manufacturing Solutions',
        location: 'Shanghai, China',
        product_type: 'Industrial Machinery Parts',
        export_market: 'Europe (Germany/Netherlands)',
        commercial_contact_person: 'Mr. Zhang Wei',
        phone_or_email: 'zhang.wei@apex-mfg.cn',
        possible_shipment_route: 'Shanghai (PVG) to Frankfurt (FRA) - Air Freight',
        possible_pain_point: 'High transit times on rail and high air rates with current carrier',
        next_action: 'Send trial quote for 3 CBM express shipment next Tuesday',
        status: 'Contacted',
        follow_up_date: today,
        notes: 'Very interested in our airline contract rates. Needs backup support.',
        created_at: new Date().toISOString()
      },
      {
        id: generateUUID(),
        user_id: userId,
        company_name: 'Bavarian Auto Components',
        location: 'Munich, Germany',
        product_type: 'Automotive Accessories',
        export_market: 'Asia (China/Vietnam)',
        commercial_contact_person: 'Dieter Mueller',
        phone_or_email: 'dieter.mueller@bavaria-auto.de',
        possible_shipment_route: 'Hamburg (HAM) to Ningbo (NGB) - Ocean FCL',
        possible_pain_point: 'Space constraints during peak shipping weeks and poor communication.',
        next_action: 'Arrange virtual meeting to present route schedule options',
        status: 'Negotiating',
        follow_up_date: today,
        notes: 'Needs premium space guarantee.',
        created_at: new Date().toISOString()
      },
      {
        id: generateUUID(),
        user_id: userId,
        company_name: 'Zenith Tech Logistics',
        location: 'Guangzhou, China',
        product_type: 'Electronics & Wearables',
        export_market: 'Global',
        commercial_contact_person: 'Ms. Helen Lee',
        phone_or_email: 'helen.lee@zenithtech.com',
        possible_shipment_route: 'Shenzhen (SZX) to London (LHR) - Air',
        possible_pain_point: 'Frequent delays at transshipment points.',
        next_action: 'Study direct air route options and draft Route Card',
        status: 'New',
        follow_up_date: today,
        notes: 'First touch completed.',
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.PROSPECTS, initialProspects);
    
    // Seed some other records to make Today dashboard look exciting
    const initialTouches: CustomerTouch[] = [
      {
        id: generateUUID(),
        user_id: userId,
        prospect_id: initialProspects[0].id,
        touch_type: 'Trial quotation request',
        date: today,
        message_summary: 'Sent immediate quotation for Frankfurt route with space protection option.',
        response_status: 'Pending review',
        next_action: 'Call on Wednesday morning to follow up on the rate',
        follow_up_date: today,
        trial_quote_asked: true,
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.TOUCHES, initialTouches);

    const initialRoutes: RouteCard[] = [
      {
        id: generateUUID(),
        user_id: userId,
        origin: 'PVG (Shanghai)',
        destination: 'FRA (Frankfurt)',
        mode: 'Air',
        carrier_or_airline: 'Lufthansa Cargo (LH)',
        transit_time: '1-2 Days',
        transshipment_point: 'Direct',
        common_cargo_type: 'Li-Battery Electronics & High-Value Parts',
        common_issue: 'Strict battery MSDS screening causing customs delays at PVG',
        agent_role: 'Eagles Germany agent acts as custom clearance coordinator at FRA',
        customer_objection: 'Rates are $0.40/kg higher than indirect carriers',
        possible_solution: 'Emphasize the 48-hour delivery speed guarantee vs 5-7 days indirect',
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.ROUTES, initialRoutes);

    const initialShipments: ShipmentFile[] = [
      {
        id: generateUUID(),
        user_id: userId,
        date: today,
        shipment_route: 'Ningbo (NGB) to Rotterdam (RTM)',
        mode: 'Ocean',
        customer_requirement: '40ft HC with strict 28-day transit limit for autumn inventory',
        booking_status: 'Confirmed with Maersk',
        document_status: 'Draft BL Approved',
        cut_off_date: today,
        cargo_handover_status: 'Containers entered port terminal',
        problem_or_delay: 'Port congestion at Rotterdam causing possible 3-day terminal delay',
        solution_taken: 'Coordinated with Europe agent to pre-clear customs and pre-book haulage',
        key_learning: 'Always secure carrier haulage 7 days prior to vessel arrival during congestion peaks',
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.SHIPMENTS, initialShipments);

    const initialAgents: Agent[] = [
      {
        id: generateUUID(),
        user_id: userId,
        name: 'Eagles Germany AG',
        location: 'Europe',
        contact_person: 'Hans Becker',
        email_or_phone: 'h.becker@eagles-de.com',
        created_at: new Date().toISOString()
      },
      {
        id: generateUUID(),
        user_id: userId,
        name: 'Eagles China Logistics Shenzhen',
        location: 'China',
        contact_person: 'Li Na',
        email_or_phone: 'li.na@eagles-cn.com',
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.AGENTS, initialAgents);

    const initialAgentTouches: AgentTouch[] = [
      {
        id: generateUUID(),
        user_id: userId,
        agent_id: initialAgents[0].id,
        agent_name: 'Eagles Germany AG',
        agent_location: 'Europe',
        date: today,
        summary: 'Checked destination handling capabilities for high-value hazardous machinery parts.',
        created_at: new Date().toISOString()
      }
    ];
    setLocalItem(LOCAL_KEYS.AGENT_TOUCHES, initialAgentTouches);
  }
}

// --- DATA ACCESS LAYER (UNIFIED API) ---
export const dataService = {
  
  // --- AUTH SERVICES ---
  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
      } catch (err) {
        console.error("Supabase auth error:", err);
        return null;
      }
    } else {
      const userStr = localStorage.getItem(LOCAL_KEYS.CURRENT_USER);
      if (!userStr) return null;
      return JSON.parse(userStr);
    }
  },

  async login(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await seedMockData(data.user.id);
      }
      return data.user;
    } else {
      const users = getLocalItem<any[]>(LOCAL_KEYS.ALL_USERS, []);
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      
      const sessionUser = { id: user.id, email: user.email };
      localStorage.setItem(LOCAL_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
      await seedMockData(user.id);
      return sessionUser;
    }
  },

  async signUp(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await seedMockData(data.user.id);
      }
      return data.user;
    } else {
      const users = getLocalItem<any[]>(LOCAL_KEYS.ALL_USERS, []);
      const existing = users.find(u => u.email === email);
      if (existing) throw new Error('User already exists');
      
      const newUser = { id: generateUUID(), email, password };
      users.push(newUser);
      setLocalItem(LOCAL_KEYS.ALL_USERS, users);
      
      const sessionUser = { id: newUser.id, email: newUser.email };
      localStorage.setItem(LOCAL_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
      await seedMockData(newUser.id);
      return sessionUser;
    }
  },

  async logout() {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(LOCAL_KEYS.CURRENT_USER);
    }
  },

  getSupabaseClient() {
    return supabase;
  },

  // --- PROFILE SERVICES ---
  async getProfile(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (error) {
          if (error.code === 'PGRST205') {
            throw new Error("DATABASE_SCHEMA_MISSING");
          }
          throw error;
        }
        return data;
      } catch (err: any) {
        console.error("Supabase getProfile error:", err);
        if (err.message === "DATABASE_SCHEMA_MISSING") throw err;
        return null;
      }
    } else {
      const profiles = getLocalItem<Profile[]>(LOCAL_KEYS.PROFILE, []);
      const p = profiles.find(item => item.user_id === userId || item.id === userId);
      return p || null;
    }
  },

  async saveProfile(profile: Partial<Profile> & { user_id: string }): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.user_id,
          full_name: profile.full_name || '',
          role: profile.role || 'Business Development Executive',
          company_name: profile.company_name || 'The Eagles Company',
          roadmap_start_date: profile.roadmap_start_date || getLocalDateString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const profiles = getLocalItem<Profile[]>(LOCAL_KEYS.PROFILE, []);
      const existingIndex = profiles.findIndex(p => p.user_id === profile.user_id || p.id === profile.user_id);
      
      const completeProfile: Profile = {
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name || '',
        role: profile.role || 'Business Development Executive',
        company_name: profile.company_name || 'The Eagles Company',
        roadmap_start_date: profile.roadmap_start_date || getLocalDateString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        profiles[existingIndex] = { ...profiles[existingIndex], ...completeProfile, updated_at: new Date().toISOString() };
      } else {
        profiles.push(completeProfile);
      }
      setLocalItem(LOCAL_KEYS.PROFILE, profiles);
      return completeProfile;
    }
  },

  // --- PROSPECTS ---
  async getProspects(userId: string): Promise<Prospect[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, []);
      return prospects.filter(p => p.user_id === userId);
    }
  },

  async addProspect(userId: string, prospect: Omit<Prospect, 'id' | 'user_id' | 'created_at'>): Promise<Prospect> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('prospects')
        .insert([{ ...prospect, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, []);
      const newProspect: Prospect = {
        ...prospect,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      prospects.unshift(newProspect);
      setLocalItem(LOCAL_KEYS.PROSPECTS, prospects);
      return newProspect;
    }
  },

  async updateProspect(userId: string, id: string, updates: Partial<Prospect>): Promise<Prospect> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, []);
      const index = prospects.findIndex(p => p.id === id && p.user_id === userId);
      if (index === -1) throw new Error('Prospect not found');
      prospects[index] = { ...prospects[index], ...updates };
      setLocalItem(LOCAL_KEYS.PROSPECTS, prospects);
      return prospects[index];
    }
  },

  async deleteProspect(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('prospects', id);
    } else {
      let prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, []);
      prospects = prospects.filter(p => !(p.id === id && p.user_id === userId));
      setLocalItem(LOCAL_KEYS.PROSPECTS, prospects);
    }
  },

  // --- CUSTOMER TOUCHES ---
  async getCustomerTouches(userId: string): Promise<CustomerTouch[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('customer_touches')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, []);
      return touches.filter(t => t.user_id === userId);
    }
  },

  async addCustomerTouch(userId: string, touch: Omit<CustomerTouch, 'id' | 'user_id' | 'created_at'>): Promise<CustomerTouch> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('customer_touches')
        .insert([{ ...touch, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, []);
      const newTouch: CustomerTouch = {
        ...touch,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      touches.unshift(newTouch);
      setLocalItem(LOCAL_KEYS.TOUCHES, touches);
      return newTouch;
    }
  },

  async updateCustomerTouch(userId: string, id: string, updates: Partial<CustomerTouch>): Promise<CustomerTouch> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('customer_touches')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, []);
      const index = touches.findIndex(t => t.id === id && t.user_id === userId);
      if (index === -1) throw new Error('Touch log not found');
      touches[index] = { ...touches[index], ...updates };
      setLocalItem(LOCAL_KEYS.TOUCHES, touches);
      return touches[index];
    }
  },

  async deleteCustomerTouch(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('customer_touches', id);
    } else {
      let touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, []);
      touches = touches.filter(t => !(t.id === id && t.user_id === userId));
      setLocalItem(LOCAL_KEYS.TOUCHES, touches);
    }
  },

  // --- SHIPMENT FILES ---
  async getShipmentFiles(userId: string): Promise<ShipmentFile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('shipment_files')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const shipments = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, []);
      return shipments.filter(s => s.user_id === userId);
    }
  },

  async addShipmentFile(userId: string, shipment: Omit<ShipmentFile, 'id' | 'user_id' | 'created_at'>): Promise<ShipmentFile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('shipment_files')
        .insert([{ ...shipment, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const shipments = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, []);
      const newShipment: ShipmentFile = {
        ...shipment,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      shipments.unshift(newShipment);
      setLocalItem(LOCAL_KEYS.SHIPMENTS, shipments);
      return newShipment;
    }
  },

  async updateShipmentFile(userId: string, id: string, updates: Partial<ShipmentFile>): Promise<ShipmentFile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('shipment_files')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const shipments = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, []);
      const index = shipments.findIndex(s => s.id === id && s.user_id === userId);
      if (index === -1) throw new Error('Shipment file not found');
      shipments[index] = { ...shipments[index], ...updates };
      setLocalItem(LOCAL_KEYS.SHIPMENTS, shipments);
      return shipments[index];
    }
  },

  async deleteShipmentFile(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('shipment_files', id);
    } else {
      let shipments = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, []);
      shipments = shipments.filter(s => !(s.id === id && s.user_id === userId));
      setLocalItem(LOCAL_KEYS.SHIPMENTS, shipments);
    }
  },

  // --- ROUTE CARDS ---
  async getRouteCards(userId: string): Promise<RouteCard[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('route_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const routes = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, []);
      return routes.filter(r => r.user_id === userId);
    }
  },

  async addRouteCard(userId: string, route: Omit<RouteCard, 'id' | 'user_id' | 'created_at'>): Promise<RouteCard> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('route_cards')
        .insert([{ ...route, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const routes = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, []);
      const newRoute: RouteCard = {
        ...route,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      routes.unshift(newRoute);
      setLocalItem(LOCAL_KEYS.ROUTES, routes);
      return newRoute;
    }
  },

  async updateRouteCard(userId: string, id: string, updates: Partial<RouteCard>): Promise<RouteCard> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('route_cards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const routes = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, []);
      const index = routes.findIndex(r => r.id === id && r.user_id === userId);
      if (index === -1) throw new Error('Route card not found');
      routes[index] = { ...routes[index], ...updates };
      setLocalItem(LOCAL_KEYS.ROUTES, routes);
      return routes[index];
    }
  },

  async deleteRouteCard(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('route_cards', id);
    } else {
      let routes = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, []);
      routes = routes.filter(r => !(r.id === id && r.user_id === userId));
      setLocalItem(LOCAL_KEYS.ROUTES, routes);
    }
  },

  // --- FREIGHT JOURNAL ---
  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const journals = getLocalItem<JournalEntry[]>(LOCAL_KEYS.JOURNALS, []);
      return journals.filter(j => j.user_id === userId);
    }
  },

  async addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>): Promise<JournalEntry> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ ...entry, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const journals = getLocalItem<JournalEntry[]>(LOCAL_KEYS.JOURNALS, []);
      
      // Enforce unique date per user
      const existingIdx = journals.findIndex(j => j.user_id === userId && j.date === entry.date);
      const newEntry: JournalEntry = {
        ...entry,
        id: existingIdx >= 0 ? journals[existingIdx].id : generateUUID(),
        user_id: userId,
        created_at: existingIdx >= 0 ? journals[existingIdx].created_at : new Date().toISOString()
      };

      if (existingIdx >= 0) {
        journals[existingIdx] = newEntry;
      } else {
        journals.unshift(newEntry);
      }
      
      setLocalItem(LOCAL_KEYS.JOURNALS, journals);
      return newEntry;
    }
  },

  async updateJournalEntry(userId: string, id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const journals = getLocalItem<JournalEntry[]>(LOCAL_KEYS.JOURNALS, []);
      const index = journals.findIndex(j => j.id === id && j.user_id === userId);
      if (index === -1) throw new Error('Journal entry not found');
      journals[index] = { ...journals[index], ...updates };
      setLocalItem(LOCAL_KEYS.JOURNALS, journals);
      return journals[index];
    }
  },

  async deleteRecord(tableName: string, recordId: string): Promise<any> {
    return centralDeleteRecord(tableName, recordId);
  },

  async deleteJournalEntry(userId: string, id: string): Promise<void> {

    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('journal_entries', id);
    } else {
      let journals = getLocalItem<JournalEntry[]>(LOCAL_KEYS.JOURNALS, []);
      journals = journals.filter(j => !(j.id === id && j.user_id === userId));
      setLocalItem(LOCAL_KEYS.JOURNALS, journals);
    }
  },

  // --- AGENTS ---
  async getAgents(userId: string): Promise<Agent[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    } else {
      const agents = getLocalItem<Agent[]>(LOCAL_KEYS.AGENTS, []);
      return agents.filter(a => a.user_id === userId);
    }
  },

  async addAgent(userId: string, agent: Omit<Agent, 'id' | 'user_id' | 'created_at'>): Promise<Agent> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('agents')
        .insert([{ ...agent, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const agents = getLocalItem<Agent[]>(LOCAL_KEYS.AGENTS, []);
      const newAgent: Agent = {
        ...agent,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      agents.push(newAgent);
      setLocalItem(LOCAL_KEYS.AGENTS, agents);
      return newAgent;
    }
  },

  async deleteAgent(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('agents', id);
    } else {
      let agents = getLocalItem<Agent[]>(LOCAL_KEYS.AGENTS, []);
      agents = agents.filter(a => !(a.id === id && a.user_id === userId));
      setLocalItem(LOCAL_KEYS.AGENTS, agents);
    }
  },

  // --- AGENT TOUCHES ---
  async getAgentTouches(userId: string): Promise<AgentTouch[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('agent_touches')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const touches = getLocalItem<AgentTouch[]>(LOCAL_KEYS.AGENT_TOUCHES, []);
      return touches.filter(t => t.user_id === userId);
    }
  },

  async addAgentTouch(userId: string, touch: Omit<AgentTouch, 'id' | 'user_id' | 'created_at'>): Promise<AgentTouch> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('agent_touches')
        .insert([{ ...touch, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const touches = getLocalItem<AgentTouch[]>(LOCAL_KEYS.AGENT_TOUCHES, []);
      const newTouch: AgentTouch = {
        ...touch,
        id: generateUUID(),
        user_id: userId,
        created_at: new Date().toISOString()
      };
      touches.unshift(newTouch);
      setLocalItem(LOCAL_KEYS.AGENT_TOUCHES, touches);
      return newTouch;
    }
  },

  async deleteAgentTouch(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('agent_touches', id);
    } else {
      let touches = getLocalItem<AgentTouch[]>(LOCAL_KEYS.AGENT_TOUCHES, []);
      touches = touches.filter(t => !(t.id === id && t.user_id === userId));
      setLocalItem(LOCAL_KEYS.AGENT_TOUCHES, touches);
    }
  },

  // --- WEEKLY REVIEWS ---
  async getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('week_start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const reviews = getLocalItem<WeeklyReview[]>(LOCAL_KEYS.REVIEWS, []);
      return reviews.filter(r => r.user_id === userId);
    }
  },

  async saveWeeklyReview(userId: string, review: Omit<WeeklyReview, 'id' | 'user_id' | 'created_at'>): Promise<WeeklyReview> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('weekly_reviews')
        .upsert({
          user_id: userId,
          week_start_date: review.week_start_date,
          prospects_count: review.prospects_count,
          touches_count: review.touches_count,
          trial_quotes_count: review.trial_quotes_count,
          shipment_files_count: review.shipment_files_count,
          route_cards_count: review.route_cards_count,
          agent_touches_count: review.agent_touches_count,
          best_learning: review.best_learning,
          biggest_weakness: review.biggest_weakness,
          next_week_focus: review.next_week_focus,
          generated_text: review.generated_text,
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,week_start_date' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const reviews = getLocalItem<WeeklyReview[]>(LOCAL_KEYS.REVIEWS, []);
      const existingIdx = reviews.findIndex(r => r.user_id === userId && r.week_start_date === review.week_start_date);
      
      const newReview: WeeklyReview = {
        ...review,
        id: existingIdx >= 0 ? reviews[existingIdx].id : generateUUID(),
        user_id: userId,
        created_at: existingIdx >= 0 ? reviews[existingIdx].created_at : new Date().toISOString()
      };

      if (existingIdx >= 0) {
        reviews[existingIdx] = newReview;
      } else {
        reviews.unshift(newReview);
      }
      setLocalItem(LOCAL_KEYS.REVIEWS, reviews);
      return newReview;
    }
  },

  async deleteWeeklyReview(userId: string, id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await dataService.deleteRecord('weekly_reviews', id);
    } else {
      let reviews = getLocalItem<WeeklyReview[]>(LOCAL_KEYS.REVIEWS, []);
      reviews = reviews.filter(r => !(r.id === id && r.user_id === userId));
      setLocalItem(LOCAL_KEYS.REVIEWS, reviews);
    }
  },


  // --- DYNAMIC DASHBOARD METRIC ENGINES (REAL DATABASE QUERIES) ---
  
  // Calculate Daily KPI progress for a specific date (usually today)
  async getDailyKPIDetails(userId: string, targetDate: string = getLocalDateString()): Promise<DailyKPIData> {
    // Fetch real records
    let prospects: Prospect[] = [];
    let touches: CustomerTouch[] = [];
    let shipmentFiles: ShipmentFile[] = [];
    let routeCards: RouteCard[] = [];
    let journalEntries: JournalEntry[] = [];

    if (isSupabaseConfigured && supabase) {
      // Direct Supabase queries filtered by user_id and date
      const [pRes, tRes, sRes, rRes, jRes] = await Promise.all([
        supabase.from('prospects').select('*').eq('user_id', userId),
        supabase.from('customer_touches').select('*').eq('user_id', userId).eq('date', targetDate),
        supabase.from('shipment_files').select('*').eq('user_id', userId).eq('date', targetDate),
        supabase.from('route_cards').select('*').eq('user_id', userId),
        supabase.from('journal_entries').select('*').eq('user_id', userId).eq('date', targetDate)
      ]);

      prospects = (pRes.data || []).filter(p => p.created_at.startsWith(targetDate));
      touches = tRes.data || [];
      shipmentFiles = sRes.data || [];
      // Route Cards created date filter (since route cards have created_at timestamp in DB)
      routeCards = (rRes.data || []).filter(r => r.created_at.startsWith(targetDate));
      journalEntries = jRes.data || [];
    } else {
      // Local storage reads
      prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, [])
        .filter(p => p.user_id === userId && p.created_at.startsWith(targetDate));
      
      touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, [])
        .filter(t => t.user_id === userId && t.date === targetDate);
        
      shipmentFiles = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, [])
        .filter(s => s.user_id === userId && s.date === targetDate);
        
      routeCards = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, [])
        .filter(r => r.user_id === userId && r.created_at.startsWith(targetDate));
        
      journalEntries = getLocalItem<JournalEntry[]>(LOCAL_KEYS.JOURNALS, [])
        .filter(j => j.user_id === userId && j.date === targetDate);
    }

    const prospectsCount = prospects.length;
    const touchesCount = touches.length;
    const trialQuotesCount = touches.filter(t => t.trial_quote_asked).length;
    const shipmentFilesCount = shipmentFiles.length;
    const routeCardsCount = routeCards.length;
    const journalEntryCount = journalEntries.length;

    const kpis = {
      prospects: prospectsCount >= 5,
      touches: touchesCount >= 3,
      trialQuotes: trialQuotesCount >= 1,
      shipmentFiles: shipmentFilesCount >= 1,
      routeCards: routeCardsCount >= 1,
      journal: journalEntryCount >= 1
    };

    const completedCount = Object.values(kpis).filter(Boolean).length;
    const score = Math.round((completedCount / 6) * 100);

    return {
      date: targetDate,
      prospectsCount,
      touchesCount,
      trialQuotesCount,
      shipmentFilesCount,
      routeCardsCount,
      journalEntryCount,
      score,
      kpis
    };
  },

  // Calculate Weekly KPI progress (tracking Sunday to Thursday)
  async getWeeklyKPIDetails(userId: string, dateInWeek: string = getLocalDateString()): Promise<WeeklyKPIData> {
    const { start, end } = getWeekStartAndEnd(dateInWeek);
    
    let prospects: Prospect[] = [];
    let touches: CustomerTouch[] = [];
    let shipmentFiles: ShipmentFile[] = [];
    let routeCards: RouteCard[] = [];
    let agentTouches: AgentTouch[] = [];
    let weeklyReviews: WeeklyReview[] = [];

    if (isSupabaseConfigured && supabase) {
      // Get all and filter client side to handle timezone & date boundary cleanly and bulletproofly
      const [pRes, tRes, sRes, rRes, aRes, wRes] = await Promise.all([
        supabase.from('prospects').select('*').eq('user_id', userId),
        supabase.from('customer_touches').select('*').eq('user_id', userId).gte('date', start).lte('date', end),
        supabase.from('shipment_files').select('*').eq('user_id', userId).gte('date', start).lte('date', end),
        supabase.from('route_cards').select('*').eq('user_id', userId),
        supabase.from('agent_touches').select('*').eq('user_id', userId).gte('date', start).lte('date', end),
        supabase.from('weekly_reviews').select('*').eq('user_id', userId).eq('week_start_date', start)
      ]);

      prospects = (pRes.data || []).filter(p => {
        const pDate = p.created_at.split('T')[0];
        return pDate >= start && pDate <= end;
      });
      touches = tRes.data || [];
      shipmentFiles = sRes.data || [];
      routeCards = (rRes.data || []).filter(r => {
        const rDate = r.created_at.split('T')[0];
        return rDate >= start && rDate <= end;
      });
      agentTouches = aRes.data || [];
      weeklyReviews = wRes.data || [];
    } else {
      prospects = getLocalItem<Prospect[]>(LOCAL_KEYS.PROSPECTS, [])
        .filter(p => {
          const pDate = p.created_at.split('T')[0];
          return p.user_id === userId && pDate >= start && pDate <= end;
        });

      touches = getLocalItem<CustomerTouch[]>(LOCAL_KEYS.TOUCHES, [])
        .filter(t => t.user_id === userId && t.date >= start && t.date <= end);

      shipmentFiles = getLocalItem<ShipmentFile[]>(LOCAL_KEYS.SHIPMENTS, [])
        .filter(s => s.user_id === userId && s.date >= start && s.date <= end);

      routeCards = getLocalItem<RouteCard[]>(LOCAL_KEYS.ROUTES, [])
        .filter(r => {
          const rDate = r.created_at.split('T')[0];
          return r.user_id === userId && rDate >= start && rDate <= end;
        });

      agentTouches = getLocalItem<AgentTouch[]>(LOCAL_KEYS.AGENT_TOUCHES, [])
        .filter(t => t.user_id === userId && t.agent_location && (t.agent_location === 'Europe' || t.agent_location === 'China') && t.date >= start && t.date <= end);

      weeklyReviews = getLocalItem<WeeklyReview[]>(LOCAL_KEYS.REVIEWS, [])
        .filter(r => r.user_id === userId && r.week_start_date === start);
    }

    const prospectsCount = prospects.length;
    const touchesCount = touches.length;
    const trialQuotesCount = touches.filter(t => t.trial_quote_asked).length;
    const shipmentFilesCount = shipmentFiles.length;
    const routeCardsCount = routeCards.length;
    const agentTouchesCount = agentTouches.length;
    const hasProgressUpdate = weeklyReviews.length > 0;

    return {
      weekStartDate: start,
      prospectsCount,
      touchesCount,
      trialQuotesCount,
      shipmentFilesCount,
      routeCardsCount,
      agentTouchesCount,
      hasProgressUpdate
    };
  },

  // Trend analysis - get scores for the last 5 days
  async getDailyScoreTrend(userId: string): Promise<{ date: string; score: number }[]> {
    const trend: { date: string; score: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const kpis = await this.getDailyKPIDetails(userId, dateStr);
      
      // Formatting date label (e.g. "Jun 29" or day of week)
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      const formattedDate = new Date(dateStr).toLocaleDateString('en-US', options);
      
      trend.push({
        date: formattedDate,
        score: kpis.score
      });
    }
    return trend;
  },

  async getDailyKPILogs(userId: string, daysCount: number = 7): Promise<DailyKPIData[]> {
    const logs: DailyKPIData[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const details = await this.getDailyKPIDetails(userId, dateStr);
      logs.push(details);
    }
    return logs;
  },

  async getWeeklyKPILogs(userId: string): Promise<WeeklyKPIData> {
    return this.getWeeklyKPIDetails(userId);
  }
};
