import { LogOut } from "lucide-react";

export default function SundogLightHeader({
  isShowLogoutButton,
  onClickLogoutButton,
}: {
  isShowLogoutButton: boolean;
  onClickLogoutButton: () => void;
}) {
  return (
    <div className={`flex items-center justify-between px-4 relative`}>
      {/* 中央揃えのためのダミー要素 */}
      <div className="w-20" />

      {/* タイトル */}
      <div className="relative">
        {/* アウトライン付きの背面テキスト */}
        <h1
          className={`
                    text-4xl 
                    text-center 
                    font-extrabold 
                    p-2
                    text-black
                    [-webkit-text-stroke:2px_black]
                `}
        >
          SUNDOG Light
        </h1>

        {/* グラデーションの前面テキスト */}
        <h1
          className={`
                    text-4xl 
                    text-center 
                    font-extrabold 
                    p-2
                    absolute
                    top-0
                    left-0
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-gray-200
                    to-cyan-200
                `}
        >
          SUNDOG Light
        </h1>
      </div>

      {/* ログアウトボタン */}
      {isShowLogoutButton ? (
        <button
          onClick={onClickLogoutButton}
          className="flex items-center justify-center gap-2 hover:text-gray-600 transition-colors"
        >
          <LogOut size={18} />
          <span>ログアウト</span>
        </button>
      ) : (
        <div className="w-20" />
      )}
    </div>
  );
}
