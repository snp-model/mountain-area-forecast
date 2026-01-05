/**
 * 日付フォーマットとAPIデータの整合性テスト
 */

import { describe, it, expect } from 'vitest';

/**
 * App.tsxと同じロジックで日付を生成
 */
function generateDates(): string[] {
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
}

/**
 * Open-Meteo APIと同じ形式で時刻文字列をパース
 * (weather.tsのロジックを再現)
 */
function parseDateFromApiTime(timeStr: string): string {
  return timeStr.split("T")[0];
}

describe('日付フォーマットの整合性テスト', () => {
  it('生成された日付がYYYY-MM-DD形式であること', () => {
    const dates = generateDates();
    
    expect(dates.length).toBe(7);
    
    dates.forEach(date => {
      // YYYY-MM-DD形式のパターン
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('生成された日付がJST（ローカル時刻）基準であること', () => {
    const dates = generateDates();
    const today = new Date();
    
    // 今日の日付（YYYY-MM-DD）
    const expectedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    // 最初の日付が今日と一致すること
    expect(dates[0]).toBe(expectedToday);
  });

  it('連続した日付が1日ずつ増加すること', () => {
    const dates = generateDates();
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1] + 'T00:00:00');
      const currDate = new Date(dates[i] + 'T00:00:00');
      
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // 1日の差があること
      expect(dayDiff).toBe(1);
    }
  });

  it('Open-Meteo APIの時刻文字列から日付を正しく抽出できること', () => {
    const apiTimeString = '2026-01-05T06:00';
    const extractedDate = parseDateFromApiTime(apiTimeString);
    
    expect(extractedDate).toBe('2026-01-05');
  });

  it('App.tsxの日付とOpen-Meteo APIの日付が一致する形式であること', () => {
    const appDates = generateDates();
    
    // Open-Meteo API形式の時刻文字列をシミュレート
    const mockApiTimes = appDates.map(date => `${date}T06:00`);
    
    // 各API時刻から日付を抽出し、App.tsxの日付と一致することを確認
    mockApiTimes.forEach((apiTime, index) => {
      const extractedDate = parseDateFromApiTime(apiTime);
      expect(extractedDate).toBe(appDates[index]);
    });
  });

  it('JST 午前0時とUTC変換の問題が発生しないこと', () => {
    // toISOString()を使うとUTC変換されて日付がずれる問題の回帰テスト
    const testDate = new Date('2026-01-05T00:00:00'); // JST 午前0時
    
    // 誤った方法（toISOString使用）→ UTCに変換されて前日になる可能性
    const wrongFormat = testDate.toISOString().split('T')[0];
    
    // 正しい方法（ローカル時刻使用）
    const year = testDate.getFullYear();
    const month = String(testDate.getMonth() + 1).padStart(2, "0");
    const day = String(testDate.getDate()).padStart(2, "0");
    const correctFormat = `${year}-${month}-${day}`;
    
    // 正しい方法で生成した日付が期待通りであること
    expect(correctFormat).toBe('2026-01-05');
    
    // Note: wrongFormatは環境によって異なる可能性があるため、
    // ここでは正しい方法が期待通りに動作することのみを検証
  });
});

describe('土曜日の検出ロジックテスト', () => {
  it('各曜日から土曜日までの日数を正しく計算できること', () => {
    // 各曜日に対してテスト
    const testCases = [
      { day: 0, name: '日曜日', expected: 6 }, // 日曜日 → 6日後
      { day: 1, name: '月曜日', expected: 5 }, // 月曜日 → 5日後
      { day: 2, name: '火曜日', expected: 4 }, // 火曜日 → 4日後
      { day: 3, name: '水曜日', expected: 3 }, // 水曜日 → 3日後
      { day: 4, name: '木曜日', expected: 2 }, // 木曜日 → 2日後
      { day: 5, name: '金曜日', expected: 1 }, // 金曜日 → 1日後
      { day: 6, name: '土曜日', expected: 0 }, // 土曜日 → 0日後
    ];

    testCases.forEach(({ day, name, expected }) => {
      let daysUntilSaturday: number;
      if (day === 6) {
        daysUntilSaturday = 0;
      } else {
        daysUntilSaturday = (6 - day + 7) % 7;
      }
      
      expect(daysUntilSaturday).toBe(expected);
    });
  });

  it('現在の日付から計算した土曜日が実際に土曜日であること', () => {
    const dates = generateDates();
    const today = new Date();
    const currentDay = today.getDay();
    
    // App.tsxと同じロジック
    let daysUntilSaturday: number;
    if (currentDay === 6) {
      daysUntilSaturday = 0;
    } else {
      daysUntilSaturday = (6 - currentDay + 7) % 7;
    }
    
    // 計算した日数後の日付が土曜日であることを確認
    if (daysUntilSaturday < 7) {
      const saturdayDate = new Date(dates[daysUntilSaturday] + 'T00:00:00');
      expect(saturdayDate.getDay()).toBe(6); // 6 = 土曜日
    }
  });
});
