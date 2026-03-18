const OURA_BASE_URL = "https://api.ouraring.com/v2/usercollection";

function getHeaders() {
  const token = process.env.NEXT_PUBLIC_OURA_ACCESS_TOKEN;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface OuraSleep {
  id: string;
  day: string;
  bedtime_start: string;
  bedtime_end: string;
  total_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  light_sleep_duration: number;
  efficiency: number;
  average_heart_rate: number;
  lowest_heart_rate: number;
}

export interface OuraActivity {
  id: string;
  day: string;
  steps: number;
  active_calories: number;
  total_calories: number;
  high_activity_time: number;
  medium_activity_time: number;
  low_activity_time: number;
  sedentary_time: number;
}

export interface OuraReadiness {
  id: string;
  day: string;
  score: number;
  temperature_deviation: number;
  contributors: {
    activity_balance: number;
    body_temperature: number;
    hrv_balance: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
  };
}

export async function fetchSleepData(startDate: string, endDate: string): Promise<OuraSleep[]> {
  try {
    const res = await fetch(
      `${OURA_BASE_URL}/daily_sleep?start_date=${startDate}&end_date=${endDate}`,
      { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`Oura API error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch Oura sleep data:", error);
    return [];
  }
}

export async function fetchActivityData(startDate: string, endDate: string): Promise<OuraActivity[]> {
  try {
    const res = await fetch(
      `${OURA_BASE_URL}/daily_activity?start_date=${startDate}&end_date=${endDate}`,
      { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`Oura API error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch Oura activity data:", error);
    return [];
  }
}

export async function fetchReadinessData(startDate: string, endDate: string): Promise<OuraReadiness[]> {
  try {
    const res = await fetch(
      `${OURA_BASE_URL}/daily_readiness?start_date=${startDate}&end_date=${endDate}`,
      { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`Oura API error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch Oura readiness data:", error);
    return [];
  }
}
