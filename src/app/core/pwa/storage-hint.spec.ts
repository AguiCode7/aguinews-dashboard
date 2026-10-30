import { BrowserInfo, detectStorageHint } from './storage-hint';

// User agents reales (recortados) de cada caso.
const UA = {
  iphoneSafari:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1',
  ipadAsMac:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  instagram:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0',
  facebook:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 [FBAN/EMA;FBAV/400.0;]',
  androidWebView:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36',
  youtubeIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 com.google.ios.youtube/19.40',
  androidChrome:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
};

function info(overrides: Partial<BrowserInfo>): BrowserInfo {
  return {
    userAgent: UA.androidChrome,
    platform: 'Linux armv8l',
    maxTouchPoints: 5,
    standalone: false,
    canInstall: false,
    ...overrides,
  };
}

describe('detectStorageHint', () => {
  it('detecta los navegadores internos de las apps', () => {
    for (const userAgent of [
      UA.instagram,
      UA.facebook,
      UA.androidWebView,
      UA.youtubeIos,
    ]) {
      expect(detectStorageHint(info({ userAgent, canInstall: true }))).toBe(
        'in-app',
      );
    }
  });

  it('avisa en Safari de iPhone y de iPad, pero no en otros navegadores', () => {
    expect(
      detectStorageHint(
        info({ userAgent: UA.iphoneSafari, platform: 'iPhone' }),
      ),
    ).toBe('ios-safari');
    expect(
      detectStorageHint(
        info({
          userAgent: UA.ipadAsMac,
          platform: 'MacIntel',
          maxTouchPoints: 5,
        }),
      ),
    ).toBe('ios-safari');
    expect(
      detectStorageHint(
        info({ userAgent: UA.iphoneChrome, platform: 'iPhone' }),
      ),
    ).toBeNull();
    expect(
      detectStorageHint(
        info({
          userAgent: UA.macSafari,
          platform: 'MacIntel',
          maxTouchPoints: 0,
        }),
      ),
    ).toBeNull();
  });

  it('ofrece instalar solo cuando el navegador lo permite', () => {
    expect(detectStorageHint(info({ canInstall: true }))).toBe('install');
    expect(detectStorageHint(info({ canInstall: false }))).toBeNull();
  });

  it('no avisa nada si ya se abre como app instalada', () => {
    expect(
      detectStorageHint(
        info({
          userAgent: UA.iphoneSafari,
          platform: 'iPhone',
          standalone: true,
        }),
      ),
    ).toBeNull();
  });
});
