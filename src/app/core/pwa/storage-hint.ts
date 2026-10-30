// Qué aviso de memoria corresponde a este navegador (null = ninguno).
//  - 'in-app': navegador interno de una app; suele borrar sus datos al cerrarse.
//  - 'ios-safari': Safari borra el almacenamiento tras 7 días sin visitas si no está instalado.
//  - 'install': el navegador ofrece instalar la app (evento beforeinstallprompt).
export type StorageHint = 'in-app' | 'ios-safari' | 'install';

// Huellas de los navegadores internos en el user agent.
// "; wv)" es el WebView de Android que usan muchas apps sin identificarse.
const IN_APP_BROWSER_PATTERN =
  /Instagram|FBAN|FBAV|FB_IAB|\bLine\/|Telegram|com\.google\.ios\.youtube|YouTube|TikTok|musical_ly|BytedanceWebview|; wv\)/i;
const IOS_DEVICE_PATTERN = /iPad|iPhone|iPod/;
// iPadOS se presenta como Mac; se distingue porque tiene pantalla táctil.
const IPADOS_PLATFORM = 'MacIntel';
const MIN_TOUCH_POINTS_IPAD = 2;
// En iOS, otros navegadores también usan WebKit pero se identifican con estas marcas.
const IOS_OTHER_BROWSERS_PATTERN =
  /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|DuckDuckGo|GSA\//;

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  standalone: boolean; // ya se abre como app instalada
  canInstall: boolean; // hubo un beforeinstallprompt
}

export function isInAppBrowser(userAgent: string): boolean {
  return IN_APP_BROWSER_PATTERN.test(userAgent);
}

export function isIosSafari(info: BrowserInfo): boolean {
  const ios =
    IOS_DEVICE_PATTERN.test(info.userAgent) ||
    (info.platform === IPADOS_PLATFORM &&
      info.maxTouchPoints >= MIN_TOUCH_POINTS_IPAD);
  return (
    ios &&
    /Safari\//.test(info.userAgent) &&
    !IOS_OTHER_BROWSERS_PATTERN.test(info.userAgent)
  );
}

// El navegador interno va primero: ahí ni instalar ni esperar sirve.
export function detectStorageHint(info: BrowserInfo): StorageHint | null {
  if (info.standalone) return null;
  if (isInAppBrowser(info.userAgent)) return 'in-app';
  if (isIosSafari(info)) return 'ios-safari';
  return info.canInstall ? 'install' : null;
}
