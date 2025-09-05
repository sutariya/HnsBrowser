const { app, BrowserWindow, protocol, session } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const dnsPacket = require('dns-packet');
const https = require('https');

// Register the 'hns' scheme as privileged before app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'hns', privileges: { secure: true, bypassCSP: true, supportFetchAPI: true, corsEnabled: true } }
]);

// Create HTTPS agent to bypass SSL verification for all requests
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Chrome-like User-Agent to mimic browser behavior
const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';

// Handle certificate errors for webview
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    console.log('Certificate error:', url, error); // Log for debugging
    event.preventDefault(); // Stop default behavior (blocking the request)
    callback(true); // Proceed with the connection
});

const DOH_RESOLVERS = [
    "https://hnsdoh.com/dns-query",
    "https://au.hnsdoh.com/dns-query",
    "https://eu.hnsdoh.com/dns-query",
    "https://na.hnsdoh.com/dns-query",
    "https://as.hnsdoh.com/dns-query",
    "https://ap.hnsdoh.com/dns-query",
    "https://1.1.1.1/dns-query", // Cloudflare fallback
    "https://8.8.8.8/dns-query" // Google fallback
];

const GATEWAYS = [
    'hns.to',
    'rsvr.xyz' // Alternative gateway
];

async function performDoHQuery(name) {
    const query = dnsPacket.encode({ type: "query", id: 1, flags: dnsPacket.RECURSION_DESIRED, questions: [{ type: 'A', name }] });
    for (const resolver of DOH_RESOLVERS) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout
        try {
            const res = await fetch(`${resolver}?dns=${query.toString("base64url")}`, {
                headers: { "accept": "application/dns-message" },
                agent: httpsAgent,
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (res.ok) {
                const decoded = dnsPacket.decode(Buffer.from(await res.arrayBuffer()));
                const ip = decoded?.answers?.find(a => a.type === 'A')?.data;
                if (ip) {
                    console.log(`Resolved ${name} to ${ip} via ${resolver}`);
                    return ip;
                }
            } else {
                console.log(`DoH query to ${resolver} failed with status: ${res.status}`);
            }
        } catch (error) {
            clearTimeout(timeout);
            console.error(`DoH query to ${resolver} failed: ${error.message}`);
        }
    }
    console.log(`No IP resolved for ${name}`);
    return null;
}

// Helper function to get platform-specific icon path
function getIconPath() {
    if (process.platform === 'win32') return 'build/icon.ico';
    if (process.platform === 'darwin') return 'build/icon.icns';
    return 'build/icon.png'; // For Linux and others
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, getIconPath()), // Set custom icon
        backgroundColor: '#0f172a', // Set background color to match theme
        show: false, // Don't show until ready-to-show
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true,
            contextIsolation: false,
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
    
    // Show window when ready to prevent visual flash
    win.once('ready-to-show', () => {
        win.show();
    });
};

app.whenReady().then(() => {
    // Clear cache to remove any cached versions
    session.defaultSession.clearCache().then(() => {
        console.log('Cache cleared successfully');
    });
    
    protocol.handle('hns', async (request) => {
        try {
            const url = new URL(request.url);
            const hostname = url.hostname;
            const requestPath = url.pathname + url.search;

            // Standard browser headers to mimic Chrome
            const headers = { 
                ...request.headers, 
                host: hostname, 
                'user-agent': CHROME_USER_AGENT,
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'connection': 'keep-alive'
            };

            let finalUrl;
            let proxyRes;

            // Try direct IP resolution with retries
            const ipAddress = await performDoHQuery(hostname);
            if (ipAddress) {
                const directUrl = `https://${ipAddress}${requestPath}`;
                console.log(`Attempting direct fetch: ${directUrl}`);
                let attempts = 0;
                const maxAttempts = 2;

                while (attempts < maxAttempts) {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout
                    try {
                        const directRes = await fetch(directUrl, { 
                            agent: httpsAgent, 
                            headers, 
                            redirect: 'follow', 
                            follow: 10,
                            signal: controller.signal 
                        });
                        clearTimeout(timeout);
                        console.log(`Direct fetch response headers:`, Object.fromEntries(directRes.headers));
                        const buffer = await directRes.buffer();
                        if (!buffer.toString('utf-8', 0, 500).includes("Welcome to nginx!")) {
                            console.log(`Direct fetch succeeded: ${directUrl}, status: ${directRes.status}`);
                            proxyRes = new fetch.Response(buffer, { status: directRes.status, headers: directRes.headers });
                            finalUrl = directUrl;
                            break;
                        } else {
                            console.log(`Direct fetch returned nginx welcome page: ${directUrl}`);
                            break; // Skip retries if nginx page is returned
                        }
                    } catch (error) {
                        clearTimeout(timeout);
                        attempts++;
                        if (error.code === 'ECONNRESET' || error.name === 'AbortError') {
                            console.warn(`Direct fetch failed (attempt ${attempts}/${maxAttempts}): ${error.message}`);
                            if (attempts === maxAttempts) {
                                console.error(`Max retries reached for ${directUrl}`);
                                break;
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                        } else {
                            console.error(`Direct fetch error: ${error.message}`);
                            break;
                        }
                    }
                }
            }

            // Try gateways if direct IP fails or returns nginx welcome
            if (!proxyRes) {
                for (const gateway of GATEWAYS) {
                    const gatewayUrl = `https://${hostname}.${gateway}${requestPath}`;
                    // Prevent invalid gateway URLs
                    if (hostname.endsWith(`.${gateway}`)) {
                        console.error(`Invalid gateway hostname: ${hostname}`);
                        continue; // Skip to next gateway
                    }
                    console.log(`Attempting gateway fetch: ${gatewayUrl}`);
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000); // 5-second timeout
                    try {
                        proxyRes = await fetch(gatewayUrl, { 
                            agent: httpsAgent, 
                            headers, 
                            redirect: 'follow', 
                            follow: 10,
                            signal: controller.signal 
                        });
                        clearTimeout(timeout);
                        finalUrl = proxyRes.url;
                        console.log(`Final URL after redirects: ${finalUrl}, status: ${proxyRes.status}`);
                        console.log(`Gateway response headers:`, Object.fromEntries(proxyRes.headers));
                        
                        if (!proxyRes.ok) {
                            const errorBody = await proxyRes.text();
                            console.error(`Gateway fetch failed: ${gatewayUrl}, status: ${proxyRes.status}, body: ${errorBody}`);
                            // Check for ToS or disabled site
                            if (finalUrl.includes('error=Site%20disabled') || errorBody.includes('Site disabled')) {
                                return new Response(`Site Disabled: ${errorBody}`, { 
                                    status: proxyRes.status,
                                    headers: { 'content-type': 'text/html' }
                                });
                            }
                            // Continue to next gateway if this one fails
                            console.log(`Gateway ${gateway} failed, trying next...`);
                            proxyRes = null;
                            continue;
                        }
                        // Success, break out of gateway loop
                        break;
                    } catch (error) {
                        clearTimeout(timeout);
                        console.error(`Gateway fetch failed: ${gatewayUrl}, error: ${error.message}`);
                        proxyRes = null;
                        continue;
                    }
                }
            }

            // If all gateways fail, return error
            if (!proxyRes) {
                console.error('All gateways failed for', hostname);
                return new Response('All gateways failed to resolve the domain. Please check your network or try again later.', { 
                    status: 502,
                    headers: { 'content-type': 'text/html' }
                });
            }
            
            const responseHeaders = {};
            proxyRes.headers.forEach((value, name) => {
                const lowerCaseName = name.toLowerCase();
                if (lowerCaseName !== 'content-security-policy' && lowerCaseName !== 'strict-transport-security' && lowerCaseName !== 'x-frame-options') {
                    responseHeaders[name] = value;
                }
            });

            const contentType = responseHeaders['content-type'] || '';
            if (contentType.includes('text/html')) {
                let html = await proxyRes.text();
                const baseTag = `<base href="hns://${hostname}/">`;
                html = html.replace(/(<head[^>]*>)/i, `$1${baseTag}`);
                return new Response(html, { headers: responseHeaders, status: proxyRes.status });
            }
            
            return new Response(await proxyRes.buffer(), { headers: responseHeaders, status: proxyRes.status });
        } catch (error) {
            console.error('Protocol handler error:', error.message);
            return new Response(`Internal Server Error: Failed to load ${request.url}. Please check your network or try again later. (${error.message})`, { 
                status: 500,
                headers: { 'content-type': 'text/html' }
            });
        }
    });
    
    createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });