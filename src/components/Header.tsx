/**
 * ヘッダーコンポーネント
 */

import { Mountain } from "lucide-react";

export function Header() {
  return (
    <header className="app-header">
      <h1 className="app-header__title">
        <Mountain size={24} />
        山域別天気予報
      </h1>
    </header>
  );
}
