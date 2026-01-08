/**
 * 山域別天気予報アプリ
 * メインアプリケーションコンポーネント
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { MountainMap } from "./components/Map";
import { DateSelector } from "./components/DateSelector";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HourlyWeatherPanel } from "./components/HourlyWeatherPanel";
import { MOUNTAIN_AREAS } from "./data/mountains";
import type { MountainArea } from "./data/mountains";
import {
  fetchAllMountainWeather,
  type MountainWeather,
  type HourlyWeather,
  fetchHourlyWeatherForMountain,
} from "./services/weather";

// キャッシュ有効時間（5分）
const CACHE_DURATION_MS = 5 * 60 * 1000;

// キャッシュのデータ型
interface HourlyCache {
  data: HourlyWeather[];
  fetchedAt: number;
}

function App() {
  const [weatherData, setWeatherData] = useState<Map<string, MountainWeather>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // 選択した山域と1時間ごとデータのステート
  const [selectedMountain, setSelectedMountain] = useState<MountainArea | null>(
    null
  );
  const [hourlyWeatherData, setHourlyWeatherData] = useState<
    HourlyWeather[] | null
  >(null);
  const [isLoadingHourly, setIsLoadingHourly] = useState(false);
  const [hourlyError, setHourlyError] = useState<string | null>(null);

  // 1時間ごとの天気データのキャッシュ
  const [hourlyCache, setHourlyCache] = useState<Map<string, HourlyCache>>(
    new Map()
  );

  // 今日から7日分の日付リストを生成（ローカル時刻＝JSTベース）
  const dates = useMemo(() => {
    const result: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // ローカル時刻でYYYY-MM-DD形式に変換（JSTに対応）
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      result.push(`${year}-${month}-${day}`);
    }
    return result;
  }, []);

  // 初期表示は直近の土曜日
  useEffect(() => {
    if (dates.length > 0 && !selectedDate) {
      const today = new Date();
      const currentDay = today.getDay(); // 0=日曜日, 6=土曜日

      // 直近の土曜日までの日数を計算
      let daysUntilSaturday: number;
      if (currentDay === 6) {
        // 今日が土曜日
        daysUntilSaturday = 0;
      } else {
        // 次の土曜日までの日数
        daysUntilSaturday = (6 - currentDay + 7) % 7;
      }

      // 7日以内なら直近の土曜日、超えていたら今日
      const initialIndex = daysUntilSaturday < 7 ? daysUntilSaturday : 0;
      setSelectedDate(dates[initialIndex]);
    }
  }, [dates, selectedDate]);

  // 天気データを取得
  useEffect(() => {
    async function loadWeather() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllMountainWeather(MOUNTAIN_AREAS);
        setWeatherData(data);
      } catch (err) {
        console.error("Failed to load weather data:", err);
        setError(
          "天気データの取得に失敗しました。しばらくしてから再読み込みしてください。"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadWeather();
  }, []);

  // マーカークリック時: 選択山域の1時間ごとデータを取得
  const handleSelectMountain = useCallback(
    async (mountain: MountainArea) => {
      setSelectedMountain(mountain);
      setHourlyError(null);

      // キャッシュをチェック
      const cached = hourlyCache.get(mountain.id);
      const now = Date.now();

      if (cached && now - cached.fetchedAt < CACHE_DURATION_MS) {
        // キャッシュが有効な場合は即座に表示
        setHourlyWeatherData(cached.data);
        return;
      }

      // キャッシュがない or 期限切れの場合はAPIから取得
      setIsLoadingHourly(true);
      setHourlyWeatherData(null);

      try {
        const hourlyData = await fetchHourlyWeatherForMountain(mountain);
        setHourlyWeatherData(hourlyData.hourlyForecasts);

        // キャッシュに保存
        setHourlyCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(mountain.id, {
            data: hourlyData.hourlyForecasts,
            fetchedAt: now,
          });
          return newCache;
        });
      } catch (err) {
        console.error("Failed to fetch hourly weather:", err);
        setHourlyError("時間別天気データの取得に失敗しました");
      } finally {
        setIsLoadingHourly(false);
      }
    },
    [hourlyCache]
  );

  // パネルを閉じる
  const handleClosePanel = useCallback(() => {
    setSelectedMountain(null);
    setHourlyWeatherData(null);
    setHourlyError(null);
  }, []);

  // 再試行ハンドラ
  const handleRetry = useCallback(() => {
    if (selectedMountain) {
      handleSelectMountain(selectedMountain);
    }
  }, [selectedMountain, handleSelectMountain]);

  // Escキーでパネルを閉じる
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedMountain) {
        handleClosePanel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMountain, handleClosePanel]);

  if (error) {
    return (
      <div className="loading-overlay">
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="app-main">
        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <>
            <MountainMap
              mountains={MOUNTAIN_AREAS}
              weatherData={weatherData}
              selectedDate={selectedDate}
              onSelectMountain={handleSelectMountain}
            />
            <DateSelector
              dates={dates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              isPanelOpen={!!selectedMountain}
            />
            {selectedMountain && (
              <HourlyWeatherPanel
                mountain={selectedMountain}
                hourlyData={hourlyWeatherData}
                selectedDate={selectedDate}
                isLoading={isLoadingHourly}
                error={hourlyError}
                onClose={handleClosePanel}
                onRetry={handleRetry}
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default App;
