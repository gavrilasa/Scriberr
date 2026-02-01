import { APP_CONFIG } from "@/config";
import { useTheme } from "@/contexts/ThemeContext";

export function AppLogo({ className = "", onClick }: { className?: string; onClick?: () => void, showText?: boolean }) {
  const clickable = typeof onClick === 'function';
  const { theme } = useTheme();

  return (
    <div
      className={`${className} flex items-end gap-2 ${clickable ? 'cursor-pointer hover:opacity-90 focus:opacity-90 outline-none' : ''}`}
      role={clickable ? 'button' as const : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!clickable) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <img 
        src={theme === 'dark' ? APP_CONFIG.ASSETS.LOGO_DARK : APP_CONFIG.ASSETS.LOGO_LIGHT} 
        alt={`${APP_CONFIG.APP_NAME} Logo`} 
        className="h-8 w-auto sm:h-9 select-none transition-all duration-300"
      />
    </div>
  )
}
