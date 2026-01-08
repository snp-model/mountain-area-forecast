/**
 * 天気サービス
 * Open-Meteo APIから山域の天気データを取得する
 */

import type { MountainArea } from "../data/mountains";

// Open-Meteo の天気コード定義
// https://open-meteo.com/en/docs
export const WEATHER_CODES: Record<
  number,
  { description: string; icon: string }
> = {
  0: { description: "快晴", icon: "☀️" },
  1: { description: "晴れ", icon: "🌤️" },
  2: { description: "くもり", icon: "⛅" },
  3: { description: "曇り", icon: "☁️" },
  45: { description: "霧", icon: "🌫️" },
  48: { description: "霧氷", icon: "🌫️" },
  51: { description: "弱い霧雨", icon: "🌧️" },
  53: { description: "霧雨", icon: "🌧️" },
  55: { description: "強い霧雨", icon: "🌧️" },
  56: { description: "着氷性の霧雨", icon: "🌧️" },
  57: { description: "強い着氷性霧雨", icon: "🌧️" },
  61: { description: "弱い雨", icon: "🌧️" },
  63: { description: "雨", icon: "🌧️" },
  65: { description: "強い雨", icon: "🌧️" },
  66: { description: "着氷性の雨", icon: "🌧️" },
  67: { description: "強い着氷性の雨", icon: "🌧️" },
  71: { description: "弱い雪", icon: "⛄" },
  73: { description: "雪", icon: "⛄" },
  75: { description: "強い雪", icon: "⛄" },
  77: { description: "霧雪", icon: "⛄" },
  80: { description: "弱いにわか雨", icon: "🌦️" },
  81: { description: "にわか雨", icon: "🌦️" },
  82: { description: "激しいにわか雨", icon: "🌦️" },
  85: { description: "弱いにわか雪", icon: "⛄" },
  86: { description: "にわか雪", icon: "⛄" },
  95: { description: "雷雨", icon: "⛈️" },
  96: { description: "雷雨（ひょう）", icon: "⛈️" },
  99: { description: "激しい雷雨", icon: "⛈️" },
};

// 天気コードの悪天候優先度（数値が大きいほど悪い）
const WEATHER_SEVERITY: Record<number, number> = {
  0: 0, // 快晴
  1: 1, // 晴れ
  2: 2, // くもり
  3: 3, // 曇り
  45: 4, // 霧
  48: 5, // 霧氷
  51: 10, // 弱い霧雨
  53: 11, // 霧雨
  55: 12, // 強い霧雨
  56: 13, // 着氷性の霧雨
  57: 14, // 強い着氷性霧雨
  61: 20, // 弱い雨
  63: 21, // 雨
  65: 22, // 強い雨
  66: 23, // 着氷性の雨
  67: 24, // 強い着氷性の雨
  80: 25, // 弱いにわか雨
  81: 26, // にわか雨
  82: 27, // 激しいにわか雨
  71: 30, // 弱い雪
  73: 31, // 雪
  75: 32, // 強い雪
  77: 33, // 霧雪
  85: 34, // 弱いにわか雪
  86: 35, // にわか雪
  95: 40, // 雷雨
  96: 41, // 雷雨（ひょう）
  99: 42, // 激しい雷雨
};

// 1日分の天気データ
export interface DailyWeather {
  date: string;
  amWeatherCode: number;
  pmWeatherCode: number;
  maxWindSpeed: number;
}

// 1時間ごとの天気データ
export interface HourlyWeather {
  time: string; // "2026-01-08T06:00"形式
  weatherCode: number;
  temperature: number; // 気温（℃）
  windSpeed: number; // 風速（m/s）
}

// 1時間ごとの天気データ（山域ごと）
export interface HourlyWeatherData {
  mountainId: string;
  hourlyForecasts: HourlyWeather[];
  fetchedAt: Date;
}

// 登山指数の定義
export type ClimbingIndex = "good" | "neutral" | "bad";

// 山域ごとの天気データ
export interface MountainWeather {
  mountainId: string;
  forecasts: DailyWeather[];
  fetchedAt: Date;
}

/**
 * 登山指数を計算
 * 天気と風速から登山の適性を3段階で判定
 */
export function calculateClimbingIndex(
  amWeatherCode: number,
  pmWeatherCode: number,
  maxWindSpeed: number
): ClimbingIndex {
  // 悪天候コード（雨・雪・雷）
  const badWeatherCodes = [
    51,
    53,
    55,
    56,
    57, // 霧雨
    61,
    63,
    65,
    66,
    67, // 雨
    71,
    73,
    75,
    77, // 雪
    80,
    81,
    82, // にわか雨
    85,
    86, // にわか雪
    95,
    96,
    99, // 雷雨
  ];

  const isAMBad = badWeatherCodes.includes(amWeatherCode);
  const isPMBad = badWeatherCodes.includes(pmWeatherCode);

  // Bad判定: 雨・雪・雷が含まれる または 強風
  if (isAMBad || isPMBad || isStrongWind(maxWindSpeed)) {
    return "bad";
  }

  // Good判定: 晴れ・くもり・霧のみ かつ 穏やかな風
  const goodWeatherCodes = [0, 1, 2, 3, 45, 48];
  const isAMGood = goodWeatherCodes.includes(amWeatherCode);
  const isPMGood = goodWeatherCodes.includes(pmWeatherCode);
  const isCalmWind = maxWindSpeed < 10;

  if (isAMGood && isPMGood && isCalmWind) {
    return "good";
  }

  // それ以外は普通
  return "neutral";
}

/**
 * 指定した時間範囲内で最も悪い天気コードを取得
 * Open-Meteo APIはtimezone指定により既にJSTで返されるため、
 * 時刻文字列を直接パースする
 */
function getWorstWeatherCode(
  hourlyTime: string[],
  hourlyWeatherCode: number[],
  startHour: number,
  endHour: number,
  targetDate: string
): number {
  let worstCode = 0;
  let worstSeverity = -1;

  for (let i = 0; i < hourlyTime.length; i++) {
    // Open-Meteo形式: "2026-01-05T06:00" (JSTで返される)
    const timeStr = hourlyTime[i];
    const dateStr = timeStr.split("T")[0];
    const hourStr = timeStr.split("T")[1];
    const hour = parseInt(hourStr.split(":")[0], 10);

    if (dateStr === targetDate && hour >= startHour && hour < endHour) {
      const code = hourlyWeatherCode[i];
      const severity = WEATHER_SEVERITY[code] ?? 0;
      if (severity > worstSeverity) {
        worstSeverity = severity;
        worstCode = code;
      }
    }
  }

  return worstCode;
}

/**
 * 強風判定
 * @param windSpeed 風速 (m/s)
 * @returns 風速15m/s以上の場合true
 */
export function isStrongWind(windSpeed: number): boolean {
  return windSpeed >= 15;
}

/**
 * 指定した時間範囲内での最大風速を取得
 */
function getMaxWindSpeed(
  hourlyTime: string[],
  hourlyWindSpeed: number[],
  startHour: number,
  endHour: number,
  targetDate: string
): number {
  let maxSpeed = 0;

  for (let i = 0; i < hourlyTime.length; i++) {
    // Open-Meteo形式: "2026-01-05T06:00" (JSTで返される)
    const timeStr = hourlyTime[i];
    const dateStr = timeStr.split("T")[0];
    const hourStr = timeStr.split("T")[1];
    const hour = parseInt(hourStr.split(":")[0], 10);

    if (dateStr === targetDate && hour >= startHour && hour < endHour) {
      maxSpeed = Math.max(maxSpeed, hourlyWindSpeed[i]);
    }
  }

  return maxSpeed;
}

/**
 * Open-Meteo APIから天気データを取得
 */
export async function fetchWeatherForMountain(
  mountain: MountainArea
): Promise<MountainWeather> {
  const params = new URLSearchParams({
    latitude: mountain.lat.toString(),
    longitude: mountain.lon.toString(),
    hourly: "weather_code,wind_speed_10m",
    timezone: "Asia/Tokyo",
    forecast_days: "7",
  });

  // 標高が高い山は標高モデルを使用
  if (mountain.elevation > 1500) {
    params.append("models", "best_match");
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch weather for ${mountain.name}`);
  }

  const data = await response.json();

  // 日ごとにデータを集計
  const forecasts: DailyWeather[] = [];
  const hourlyTime: string[] = data.hourly.time;
  const hourlyWeatherCode: number[] = data.hourly.weather_code;
  const hourlyWindSpeed: number[] = data.hourly.wind_speed_10m;

  // ユニークな日付を抽出
  const dates = [...new Set(hourlyTime.map((t: string) => t.split("T")[0]))];

  for (const date of dates) {
    // 午前 (06:00-12:00) の最悪天気
    const amWeatherCode = getWorstWeatherCode(
      hourlyTime,
      hourlyWeatherCode,
      6,
      12,
      date
    );

    // 午後 (12:00-18:00) の最悪天気
    const pmWeatherCode = getWorstWeatherCode(
      hourlyTime,
      hourlyWeatherCode,
      12,
      18,
      date
    );

    // 日中 (06:00-18:00) の最大風速
    const maxWindSpeed = getMaxWindSpeed(
      hourlyTime,
      hourlyWindSpeed,
      6,
      18,
      date
    );

    forecasts.push({
      date,
      amWeatherCode,
      pmWeatherCode,
      maxWindSpeed: Math.round(maxWindSpeed),
    });
  }

  // デバッグ用ログ
  console.log(
    `[Weather] ${mountain.name}: ${forecasts.length} days`,
    forecasts.slice(0, 2)
  );

  return {
    mountainId: mountain.id,
    forecasts,
    fetchedAt: new Date(),
  };
}

/**
 * 複数の山域の天気を一括取得
 */
export async function fetchAllMountainWeather(
  mountains: MountainArea[]
): Promise<Map<string, MountainWeather>> {
  const results = new Map<string, MountainWeather>();

  // API負荷軽減のため、並列数を制限
  const batchSize = 5;
  for (let i = 0; i < mountains.length; i += batchSize) {
    const batch = mountains.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((m) => fetchWeatherForMountain(m))
    );
    for (const result of batchResults) {
      results.set(result.mountainId, result);
    }
  }

  return results;
}

/**
 * 特定の山域の1時間ごとの天気を取得（オンデマンド）
 * マーカークリック時に呼び出される
 */
export async function fetchHourlyWeatherForMountain(
  mountain: MountainArea
): Promise<HourlyWeatherData> {
  const params = new URLSearchParams({
    latitude: mountain.lat.toString(),
    longitude: mountain.lon.toString(),
    hourly: "weather_code,wind_speed_10m,temperature_2m",
    timezone: "Asia/Tokyo",
    forecast_days: "7",
  });

  // 標高が高い山は標高モデルを使用
  if (mountain.elevation > 1500) {
    params.append("models", "best_match");
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch hourly weather for ${mountain.name}`);
  }

  const data = await response.json();

  // 1時間ごとのデータを抽出
  const hourlyForecasts: HourlyWeather[] = [];
  const hourlyTime: string[] = data.hourly.time;
  const hourlyWeatherCode: number[] = data.hourly.weather_code;
  const hourlyTemperature: number[] = data.hourly.temperature_2m;
  const hourlyWindSpeed: number[] = data.hourly.wind_speed_10m;

  for (let i = 0; i < hourlyTime.length; i++) {
    hourlyForecasts.push({
      time: hourlyTime[i],
      weatherCode: hourlyWeatherCode[i],
      temperature: Math.round(hourlyTemperature[i] * 10) / 10, // 小数点第1位まで
      windSpeed: Math.round(hourlyWindSpeed[i]),
    });
  }

  console.log(
    `[Hourly Weather] ${mountain.name}: ${hourlyForecasts.length} hours`
  );

  return {
    mountainId: mountain.id,
    hourlyForecasts,
    fetchedAt: new Date(),
  };
}
