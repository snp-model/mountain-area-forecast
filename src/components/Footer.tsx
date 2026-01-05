/**
 * フッターコンポーネント
 * データソースとクレジット表示
 */

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <span className="footer__text">
          天気予報データ: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="footer__link">Open-Meteo API</a>
        </span>
        <span className="footer__separator">|</span>
        <span className="footer__text">
          地図: <a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer" className="footer__link">国土地理院</a>
        </span>
      </div>
    </footer>
  );
}
