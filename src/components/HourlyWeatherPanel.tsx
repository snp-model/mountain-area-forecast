/**
 * 1時間ごとの天気パネルコンポーネント
 * 選択した山域の時間別天気を表示
 */

import type { MountainArea } from "../data/mountains";
import type { HourlyWeather } from "../services/weather";
import {
  WEATHER_CODES,
  calculateClimbingIndex,
  isStrongWind,
} from "../services/weather";

interface HourlyWeatherPanelProps {
  mountain: MountainArea | null;
  hourlyData: HourlyWeather[] | null;
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

/**
 * 時刻を「HH:00」形式にフォーマット
 */
function formatTime(timeStr: string): string {
  const hour = timeStr.split("T")[1].split(":")[0];
  return `${hour}:00`;
}

/**
 * 指定日の1時間ごとデータをフィルタリング
 */
function filterDataByDate(
  hourlyData: HourlyWeather[],
  targetDate: string
): HourlyWeather[] {
  return hourlyData.filter((item) => item.time.startsWith(targetDate));
}

export function HourlyWeatherPanel({
  mountain,
  hourlyData,
  selectedDate,
  isLoading,
  error,
  onClose,
  onRetry,
}: HourlyWeatherPanelProps) {
  if (!mountain) return null;

  // 選択日のデータをフィルタリング
  const dayData =
    hourlyData && selectedDate
      ? filterDataByDate(hourlyData, selectedDate)
      : [];

  return (
    <div className="hourly-weather-panel">
      <div className="hourly-weather-panel__header">
        <div className="hourly-weather-panel__title">
          <strong>{mountain.region}</strong>
          <span className="hourly-weather-panel__subtitle">
            {mountain.name} {mountain.elevation}m
          </span>
        </div>
        <button
          className="hourly-weather-panel__close"
          onClick={onClose}
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      <div className="hourly-weather-panel__content">
        {error ? (
          <div className="hourly-weather-panel__error">
            <p>⚠️ {error}</p>
            <button onClick={onRetry}>再試行</button>
          </div>
        ) : isLoading ? (
          <div className="hourly-weather-panel__loading">
            <div className="loading-spinner"></div>
            <p>データを読み込み中...</p>
          </div>
        ) : dayData.length > 0 ? (
          <div className="hourly-weather-panel__scroll">
            {dayData.map((item) => {
              const weatherInfo = WEATHER_CODES[item.weatherCode] || {
                icon: "❓",
                description: "不明",
              };

              // 登山指数を計算（午前＝午後と仮定してweatherCodeを2回使用）
              const climbingIndex = calculateClimbingIndex(
                item.weatherCode,
                item.weatherCode,
                item.windSpeed
              );

              return (
                <div
                  key={item.time}
                  className={`hourly-weather-item hourly-weather-item--${climbingIndex}`}
                >
                  <div className="hourly-weather-item__time">
                    {formatTime(item.time)}
                  </div>
                  <div
                    className="hourly-weather-item__icon"
                    title={weatherInfo.description}
                  >
                    {weatherInfo.icon}
                  </div>
                  <div className="hourly-weather-item__description">
                    {weatherInfo.description}
                  </div>
                  <div className="hourly-weather-item__temp">
                    {item.temperature}°C
                  </div>
                  <div
                    className={`hourly-weather-item__wind ${
                      isStrongWind(item.windSpeed)
                        ? "hourly-weather-item__wind--strong"
                        : ""
                    }`}
                  >
                    {item.windSpeed}m/s
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="hourly-weather-panel__no-data">
            データがありません
          </div>
        )}
      </div>
    </div>
  );
}
