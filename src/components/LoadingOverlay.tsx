/**
 * ローディングオーバーレイコンポーネント
 */

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({
  message = "天気データを取得中...",
}: LoadingOverlayProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}
