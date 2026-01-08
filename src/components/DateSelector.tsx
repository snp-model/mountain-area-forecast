/**
 * 日付セレクタコンポーネント
 * 1週間分の日付を選択できるボタンを表示
 */

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  isPanelOpen?: boolean;
}

/**
 * 日付を日本語で「1/5(日)」形式にフォーマット
 */
function formatDate(dateStr: string, isToday: boolean): string {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  if (isToday) {
    return `今日 ${month}/${day}`;
  }

  return `${month}/${day}(${weekday})`;
}

export function DateSelector({
  dates,
  selectedDate,
  onSelectDate,
  isPanelOpen = false,
}: DateSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className={`date-selector ${
        isPanelOpen ? "date-selector--panel-open" : ""
      }`}
    >
      {dates.map((date) => (
        <button
          key={date}
          className={`date-selector__button ${
            date === selectedDate ? "date-selector__button--active" : ""
          }`}
          onClick={() => onSelectDate(date)}
        >
          {formatDate(date, date === today)}
        </button>
      ))}
    </div>
  );
}
