export type UserRole = "admin" | "worker" | "user";

export interface User {
  id: number;
  username: string;
  customer_id: string | null;
  role: UserRole;
  phone_number: string | null;
  address: string | null;
  is_active: number;
  last_login: string | null;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_id: string | null;
  name: string;
  address: string;
  phone_number: string | null;
  meter_serial: string | null;
  customer_type: "residential" | "business";
  status: "active" | "suspended";
  email: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  installation_date: string | null;
  user_id: number | null;
  created_at: string;
}

export interface MeterReading {
  id: number;
  customer_id: number;
  reading: number;
  previous_reading: number;
  consumption: number;
  month: string;
  image_url: string | null;
  note: string | null;
  is_anomaly: boolean;
  created_by: number;
  created_at: string;
}

export interface Bill {
  id: number;
  customer_id: number;
  reading_id: number;
  month: string;
  bill_number: string | null;
  consumption: number;
  water_amount: number;
  vat_amount: number;
  env_fee_amount: number;
  previous_debt: number;
  total_amount: number;
  status: "unpaid" | "paid" | "partial";
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon_type: "users" | "droplets" | "dollar" | "alert";
  color: string;
}

export interface RecentActivity {
  id: number;
  description: string;
  time_ago: string;
  type: string;
}

export interface ConsumptionStat {
  month: string;
  consumption: number;
}

export interface DashboardSummary {
  stats: DashboardStat[];
  recent_activities: RecentActivity[];
  bill_overview: {
    total_unpaid: number;
    unpaid_count: number;
    total_collected: number;
  };
  anomalies: {
    id: number;
    customer_name: string;
    month: string;
    consumption: number;
    time_ago: string;
  }[];
  consumption_history: ConsumptionStat[];
}
