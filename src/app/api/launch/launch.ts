import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Configurar o plugin stealth para evitar detecção
puppeteer.use(StealthPlugin());

const userAgents = {
    windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    macos: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
};

import type { Profile, Proxy } from '@/lib/types';

interface FingerprintData {
  webgl?: string;
  canvas?: string;
  language?: string;
  timezone?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  fonts?: string;
  plugins?: string;
  screenWidth?: number;
  screenHeight?: number;
  colorDepth?: number;
  audioContext?: string;
}

export async function launchProfile(profile: Profile, proxy?: Proxy) {
    const launchArgs: string[] = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions-except',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
    ];
    
    if (proxy) {
        launchArgs.push(`--proxy-server=${proxy.type}://${proxy.host}:${proxy.port}`);
    }
    
    const userDataDir = `./chromium-profiles/${profile.id}`;
    launchArgs.push(`--user-data-dir=${userDataDir}`);

    console.log('Argumentos de lançamento:', launchArgs);

    const browser = await puppeteer.launch({
        headless: false,
        args: launchArgs,
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        executablePath: undefined, // Usa o Chromium bundled
    });
    
    const page = await browser.newPage();
    
    if (profile.fingerprint?.userAgent && profile.fingerprint.userAgent.length > 0) {
        await page.setUserAgent(profile.fingerprint.userAgent);
    } else {
        await page.setUserAgent(userAgents[profile.os as keyof typeof userAgents] || userAgents.windows);
    }
    
    if (proxy && proxy.username && proxy.password) {
        await page.authenticate({
            username: proxy.username,
            password: proxy.password
        });
    }
    await page.evaluate((fp: FingerprintData) => {
        if (fp.webgl) {
            try {
                const getParameter = WebGLRenderingContext.prototype.getParameter;
                WebGLRenderingContext.prototype.getParameter = function(parameter) {
                    if (parameter === 37445) return fp.webgl;
                    if (parameter === 37446) return fp.webgl;
                    return getParameter.call(this, parameter);
                };
            } catch {}
        }
        if (fp.canvas) {
            try {
                HTMLCanvasElement.prototype.toDataURL = function() { return fp.canvas; };
            } catch {}
        }
        if (fp.language) {
            Object.defineProperty(navigator, 'language', { get: () => fp.language });
            Object.defineProperty(navigator, 'languages', { get: () => [fp.language] });
        }
        if (fp.timezone) {
            try {
                Intl.DateTimeFormat = (function(orig) {
                    return function(locale, opts) {
                        opts = opts || {};
                        opts.timeZone = fp.timezone;
                        return orig(locale, opts);
                    };
                })(Intl.DateTimeFormat);
            } catch {}
        }
        if (fp.hardwareConcurrency) {
            Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => Number(fp.hardwareConcurrency) });
        }
        if (fp.deviceMemory) {
            Object.defineProperty(navigator, 'deviceMemory', { get: () => Number(fp.deviceMemory) });
        }
        if (fp.fonts) {
            try {
                // Manipula a detecção de fontes através do CSS
                const style = document.createElement('style');
                style.textContent = `
                    @font-face {
                        font-family: 'CustomFont';
                        src: url('data:font/woff2;base64,') format('woff2');
                    }
                `;
                document.head.appendChild(style);
                
                // Override da função de detecção de fontes
                const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
                const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
                
                if (originalOffsetWidth && originalOffsetHeight) {
                    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
                        get: function() {
                            if (this.style && this.style.fontFamily) {
                                const fonts = fp.fonts.split(',').map((f: string) => f.trim());
                                if (fonts.includes(this.style.fontFamily.replace(/['"]/g, ''))) {
                                    return originalOffsetWidth.get?.call(this) || 0;
                                }
                            }
                            return originalOffsetWidth.get?.call(this) || 0;
                        }
                    });
                }
            } catch (e) {
                console.warn('Erro ao configurar fingerprint de fontes:', e);
            }
        }
        if (fp.plugins) {
            Object.defineProperty(navigator, 'plugins', { get: () => fp.plugins.split(',') });
        }
        if (fp.screenWidth && fp.screenHeight && fp.colorDepth) {
            Object.defineProperty(window, 'screen', {
                value: {
                    width: Number(fp.screenWidth),
                    height: Number(fp.screenHeight),
                    colorDepth: Number(fp.colorDepth)
                }
            });
        }
        if (fp.audioContext) {
            window.__audioContextFingerprint = fp.audioContext;
        }
    }, profile.fingerprint || {});
    
    console.log('Navegando para a página de teste...');
    await page.goto('https://www.whatismybrowser.com/detect/what-is-my-user-agent', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
    });
    
    console.log('Navegador iniciado com sucesso. Aguardando fechamento...');
    
    // Aguarda o navegador ser fechado pelo usuário
    await new Promise(resolve => {
        browser.on('disconnected', () => {
            console.log('Navegador foi fechado pelo usuário');
            resolve(undefined);
        });
    });
    
    return { message: 'Sessão do navegador encerrada' };
}