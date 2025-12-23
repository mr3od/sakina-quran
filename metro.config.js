// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add wasm asset support
config.resolver.assetExts.push('wasm');

// Add COEP and COOP headers to support SharedArrayBuffer
config.server.enhanceMiddleware = (middleware) => {
    return (req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        middleware(req, res, next);
    };
};

module.exports = withUniwindConfig(config, {
    // relative path to your global.css file (from previous step)
    cssEntryFile: './src/global.css',
    // (optional) path where we gonna auto-generate typings
    // defaults to project's root
    dtsFile: './src/uniwind-types.d.ts',
    extraThemes: ['fajr', 'layl', 'asr', 'tahajjud', 'masjid'],
});