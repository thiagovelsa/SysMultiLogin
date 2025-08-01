import { NextRequest, NextResponse } from 'next/server';

interface FingerprintConfig {
    os: 'windows' | 'macos' | 'linux';
    browser: 'chrome' | 'firefox' | 'safari' | 'edge';
    version?: string;
}

const userAgents = {
    windows: {
        chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
        edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0'
    },
    macos: {
        chrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:126.0) Gecko/20100101 Firefox/126.0',
        safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
    },
    linux: {
        chrome: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        firefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0'
    }
};

const commonFonts = {
    windows: 'Arial,Helvetica,Times New Roman,Courier New,Verdana,Georgia,Palatino,Garamond,Bookman,Trebuchet MS,Arial Black,Impact',
    macos: 'Helvetica Neue,Arial,Times,Courier,Verdana,Georgia,Palatino,Garamond,Bookman,Trebuchet MS,Impact,Monaco',
    linux: 'DejaVu Sans,Liberation Sans,Ubuntu,Droid Sans,Roboto,Noto Sans,Open Sans,Source Sans Pro'
};

const timezones = {
    windows: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin'],
    macos: ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'],
    linux: ['UTC', 'Europe/London', 'America/New_York', 'Europe/Berlin']
};

const languages = {
    windows: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'pt-BR'],
    macos: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'ja-JP'],
    linux: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'es-ES']
};

function generateRandomFingerprint(config: FingerprintConfig) {
    const { os, browser } = config;
    
    // User Agent
    const userAgent = userAgents[os]?.[browser as keyof typeof userAgents[typeof os]] || userAgents.windows.chrome;
    
    // Screen resolution baseada no OS
    const screenResolutions = {
        windows: [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1536, height: 864 },
            { width: 1440, height: 900 }
        ],
        macos: [
            { width: 2560, height: 1600 },
            { width: 1920, height: 1200 },
            { width: 1680, height: 1050 },
            { width: 1440, height: 900 }
        ],
        linux: [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 1600, height: 900 },
            { width: 1280, height: 1024 }
        ]
    };
    
    const resolution = screenResolutions[os][Math.floor(Math.random() * screenResolutions[os].length)];
    
    // Hardware baseado no OS
    const hardwareConcurrency = os === 'macos' ? 
        [4, 8, 12][Math.floor(Math.random() * 3)] : 
        [2, 4, 6, 8][Math.floor(Math.random() * 4)];
    
    const deviceMemory = os === 'macos' ? 
        [8, 16, 32][Math.floor(Math.random() * 3)] : 
        [4, 8, 16][Math.floor(Math.random() * 3)];
    
    // WebGL e Canvas fingerprints únicos
    const webglVendor = os === 'macos' ? 'Apple Inc.' : 
                       os === 'linux' ? 'Mesa/X.org' : 'Google Inc.';
    
    const webglRenderer = os === 'macos' ? 'Apple GPU' :
                         os === 'linux' ? 'llvmpipe (LLVM 12.0.0, 256 bits)' :
                         'ANGLE (Intel, Intel(R) HD Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)';
    
    // Timezone e language baseados no OS
    const timezone = timezones[os][Math.floor(Math.random() * timezones[os].length)];
    const language = languages[os][Math.floor(Math.random() * languages[os].length)];
    
    // Plugins baseados no browser e OS
    const plugins = browser === 'chrome' ? 
        'PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF' :
        browser === 'firefox' ?
        'PDF.js,OpenH264 Video Codec provided by Cisco Systems' :
        'PDF Viewer,QuickTime Plug-in';
    
    return {
        userAgent,
        screenWidth: resolution.width,
        screenHeight: resolution.height,
        colorDepth: 24,
        hardwareConcurrency,
        deviceMemory,
        timezone,
        language,
        fonts: commonFonts[os],
        plugins,
        webgl: `${webglVendor}~${webglRenderer}`,
        canvas: `data:image/png;base64,${Buffer.from(Math.random().toString()).toString('base64')}`,
        audioContext: Math.random().toString(36).substring(7)
    };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { os = 'windows', browser = 'chrome', version } = body as FingerprintConfig;
        
        // Validação
        if (!['windows', 'macos', 'linux'].includes(os)) {
            return NextResponse.json(
                { error: 'OS deve ser: windows, macos ou linux' },
                { status: 400 }
            );
        }
        
        if (!['chrome', 'firefox', 'safari', 'edge'].includes(browser)) {
            return NextResponse.json(
                { error: 'Browser deve ser: chrome, firefox, safari ou edge' },
                { status: 400 }
            );
        }
        
        // Validação de compatibilidade
        if (os === 'macos' && browser === 'edge') {
            return NextResponse.json(
                { error: 'Edge não está disponível para macOS' },
                { status: 400 }
            );
        }
        
        if (os === 'linux' && browser === 'safari') {
            return NextResponse.json(
                { error: 'Safari não está disponível para Linux' },
                { status: 400 }
            );
        }
        
        const fingerprint = generateRandomFingerprint({ os, browser, version });
        
        return NextResponse.json({
            success: true,
            fingerprint,
            metadata: {
                generated_at: new Date().toISOString(),
                os,
                browser,
                version: version || 'latest'
            }
        });
        
    } catch (error) {
        console.error('Erro ao gerar fingerprint:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'API de Geração de Fingerprints',
        usage: {
            method: 'POST',
            body: {
                os: 'windows | macos | linux',
                browser: 'chrome | firefox | safari | edge',
                version: 'string (opcional)'
            }
        },
        compatibility: {
            windows: ['chrome', 'firefox', 'edge'],
            macos: ['chrome', 'firefox', 'safari'],
            linux: ['chrome', 'firefox']
        }
    });
}