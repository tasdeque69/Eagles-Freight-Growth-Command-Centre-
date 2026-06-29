export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  company_name: string;
  roadmap_start_date: string;
  created_at: string;
  updated_at?: string;
}

export interface Prospect {
  id: string;
  user_id: string;
  company_name: string;
  location: string;
  product_type: string;
  export_market: string;
  commercial_contact_person: string;
  phone_or_email: string;
  possible_shipment_route: string;
  possible_pain_point: string;
  next_action: string;
  status: 'New' | 'Contacted' | 'Negotiating' | 'Closed Won' | 'Closed Lost';
  follow_up_date: string;
  notes: string;
  created_at: string;
}

export interface CustomerTouch {
  id: string;
  user_id: string;
  prospect_id?: string;
  touch_type: 
    | 'Meeting follow-up'
    | 'Pending quotation follow-up'
    | 'Company profile follow-up'
    | 'Trial quotation request'
    | 'Shipment route discussion'
    | 'Backup rate support'
    | 'Customer value message';
  date: string;
  message_summary: string;
  response_status: string;
  next_action: string;
  follow_up_date: string;
  trial_quote_asked: boolean;
  created_at: string;
}

export interface ShipmentFile {
  id: string;
  user_id: string;
  date: string;
  shipment_route: string;
  mode: 'Air' | 'Ocean' | 'Rail' | 'Road' | 'Express';
  customer_requirement: string;
  booking_status: string;
  document_status: string;
  cut_off_date: string;
  cargo_handover_status: string;
  problem_or_delay: string;
  solution_taken: string;
  key_learning: string;
  created_at: string;
}

export interface RouteCard {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  mode: 'Air' | 'Ocean' | 'Rail' | 'Road' | 'Express';
  carrier_or_airline: string;
  transit_time: string;
  transshipment_point: string;
  common_cargo_type: string;
  common_issue: string;
  agent_role: string;
  customer_objection: string;
  possible_solution: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  today_i_learned: string;
  one_document_i_saw: string;
  one_shipment_route_i_studied: string;
  one_customer_followed_up: string;
  one_agent_contacted: string;
  one_mistake_found: string;
  tomorrow_target: string;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  location: 'China' | 'Europe' | 'Other';
  contact_person: string;
  email_or_phone: string;
  created_at: string;
}

export interface AgentTouch {
  id: string;
  user_id: string;
  agent_id?: string;
  agent_name: string;
  agent_location: 'China' | 'Europe';
  date: string;
  summary: string;
  created_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start_date: string; // Sunday date
  prospects_count: number;
  touches_count: number;
  trial_quotes_count: number;
  shipment_files_count: number;
  route_cards_count: number;
  agent_touches_count: number;
  best_learning: string;
  biggest_weakness: string;
  next_week_focus: string;
  generated_text: string;
  created_at: string;
}

export interface DailyKPIData {
  date: string;
  prospectsCount: number;
  touchesCount: number;
  trialQuotesCount: number;
  shipmentFilesCount: number;
  routeCardsCount: number;
  journalEntryCount: number;
  score: number; // calculated completed KPI count / 6 * 100
  kpis: {
    prospects: boolean; // >= 5
    touches: boolean; // >= 3
    trialQuotes: boolean; // >= 1
    shipmentFiles: boolean; // >= 1
    routeCards: boolean; // >= 1
    journal: boolean; // >= 1
  };
}

export interface WeeklyKPIData {
  weekStartDate: string;
  prospectsCount: number; // Target 25
  touchesCount: number; // Target 15
  trialQuotesCount: number; // Target 5
  shipmentFilesCount: number; // Target 5
  routeCardsCount: number; // Target 5
  agentTouchesCount: number; // Target 10 (China/Europe touches)
  hasProgressUpdate: boolean; // Target 1 (weekly review completed or similar tracker)
}

// GROWTH TABLES

export interface FiveYearRoadmap {
  id: string;
  user_id: string;
  roadmap_year: string;
  phase_name: string;
  year_start_date: string;
  year_end_date: string;
  annual_focus: string;
  annual_success_definition: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnnualGoal {
  id: string;
  user_id: string;
  year: string;
  category: string;
  goal_title: string;
  goal_description: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
  evidence_notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuarterlySprint {
  id: string;
  user_id: string;
  year: string;
  quarter: string;
  theme: string;
  priority_outcome_1: string;
  priority_outcome_2: string;
  priority_outcome_3: string;
  month_1_focus: string;
  month_2_focus: string;
  month_3_focus: string;
  review_notes: string;
  completion_score: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface SkillMatrix {
  id: string;
  user_id: string;
  skill_category: string;
  skill_name: string;
  maturity_level: number;
  evidence_link: string;
  improvement_note: string;
  next_action: string;
  last_reviewed: string;
  created_at?: string;
  updated_at?: string;
}

export interface MarketIntelligence {
  id: string;
  user_id: string;
  date: string;
  category: string;
  headline: string;
  source_name: string;
  source_link: string;
  summary: string;
  why_it_matters: string;
  action_for_bd: string;
  related_route: string;
  related_customer_segment: string;
  confidence_level: string;
  important: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AIPromptLibrary {
  id: string;
  user_id: string;
  prompt_title: string;
  category: string;
  tool_recommended: string;
  prompt_text: string;
  input_needed: string;
  output_expected: string;
  privacy_level: string;
  last_used: string;
  effectiveness_rating: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface GrowthPortfolio {
  id: string;
  user_id: string;
  evidence_title: string;
  evidence_type: string;
  date: string;
  summary: string;
  business_value: string;
  skill_demonstrated: string;
  visibility: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}
