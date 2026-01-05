/**
 * 天気マーカーコンポーネント
 * 地図上に表示する山域ごとの天気情報を持つマーカー
 */

import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { MountainArea } from "../../data/mountains";
import type { DailyWeather } from "../../services/weather";
import { WEATHER_CODES, calculateClimbingIndex } from "../../services/weather";

interface WeatherMarkerProps {
  mountain: MountainArea;
  weather: DailyWeather | null;
}

/**
 * カスタムDivIconを生成
 */
function createWeatherIcon(
  mountain: MountainArea,
  weather: DailyWeather | null
): L.DivIcon {
  const amIcon = weather
    ? WEATHER_CODES[weather.amWeatherCode]?.icon || "❓"
    : "⏳";
  const pmIcon = weather
    ? WEATHER_CODES[weather.pmWeatherCode]?.icon || "❓"
    : "⏳";
  const windSpeed = weather ? `${weather.maxWindSpeed}m/s` : "--";

  // 登山指数を計算
  const climbingIndex = weather
    ? calculateClimbingIndex(
        weather.amWeatherCode,
        weather.pmWeatherCode,
        weather.maxWindSpeed
      )
    : "neutral";

  const html = `
    <div class="weather-marker weather-marker--${climbingIndex}">
      <div class="weather-marker__name">${mountain.region}</div>
      <div class="weather-marker__weather">
        <span>${amIcon}</span>
        <span class="weather-marker__arrow">→</span>
        <span>${pmIcon}</span>
      </div>
      <div class="weather-marker__wind">💨 ${windSpeed}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [120, 80],
    iconAnchor: [60, 40],
  });
}

export function WeatherMarker({ mountain, weather }: WeatherMarkerProps) {
  const icon = createWeatherIcon(mountain, weather);

  const amDesc = weather
    ? WEATHER_CODES[weather.amWeatherCode]?.description || "不明"
    : "読込中";
  const pmDesc = weather
    ? WEATHER_CODES[weather.pmWeatherCode]?.description || "不明"
    : "読込中";

  return (
    <Marker position={[mountain.lat, mountain.lon]} icon={icon}>
      <Tooltip direction="top" offset={[0, -30]}>
        <div style={{ textAlign: "center" }}>
          <strong>{mountain.name}</strong>
          <br />
          午前: {amDesc} → 午後: {pmDesc}
          <br />
          最大風速: {weather?.maxWindSpeed ?? "--"}m/s
        </div>
      </Tooltip>
    </Marker>
  );
}
