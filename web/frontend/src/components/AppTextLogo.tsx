import { APP_CONFIG } from "@/config";

export function AppTextLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={APP_CONFIG.ASSETS.LOGO_TEXT_SVG} 
      alt={`${APP_CONFIG.APP_NAME} Text Logo`}
      className={className}
    />
  );
}
