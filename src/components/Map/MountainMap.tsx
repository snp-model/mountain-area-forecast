/**
 * 山岳地図コンポーネント
 * 日本全国の山域を表示し、天気マーカーをレンダリングする
 */

import { MapContainer, TileLayer } from "react-leaflet";
import { WeatherMarker } from "./WeatherMarker";
import type { MountainArea } from "../../data/mountains";
import type { MountainWeather, DailyWeather } from "../../services/weather";

interface MountainMapProps {
  mountains: MountainArea[];
  weatherData: Map<string, MountainWeather>;
  selectedDate: string;
  onSelectMountain: (mountain: MountainArea) => void;
}

// 富士山と八ヶ岳の中間付近を初期表示のセンターに設定
const JAPAN_CENTER: [number, number] = [36.275, 138.6];
const DEFAULT_ZOOM = 7;

// 日本の境界（移動範囲制限）
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [24.0, 122.0], // 南西端（与那国島付近）
  [46.0, 154.0], // 北東端（択捉島付近）
];

/**
 * 指定日の天気データを取得
 */
function getWeatherForDate(
  mountainId: string,
  weatherData: Map<string, MountainWeather>,
  selectedDate: string
): DailyWeather | null {
  const mountainWeather = weatherData.get(mountainId);
  if (!mountainWeather) return null;

  return mountainWeather.forecasts.find((f) => f.date === selectedDate) || null;
}

export function MountainMap({
  mountains,
  weatherData,
  selectedDate,
  onSelectMountain,
}: MountainMapProps) {
  return (
    <MapContainer
      center={JAPAN_CENTER}
      zoom={DEFAULT_ZOOM}
      maxBounds={JAPAN_BOUNDS}
      maxBoundsViscosity={1.0}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      dragging={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png"
      />
      {mountains.map((mountain) => (
        <WeatherMarker
          key={mountain.id}
          mountain={mountain}
          weather={getWeatherForDate(mountain.id, weatherData, selectedDate)}
          onClick={onSelectMountain}
        />
      ))}
    </MapContainer>
  );
}
