class ProxyHandler {
    constructor() {
        this.proxyList = [];
    }

    addProxy(proxyString) {
        // Parse proxy format: username:password@host:port
        const proxyData = this.parseProxy(proxyString);
        this.proxyList.push(proxyData);
    }

    getRandomProxy() {
        return this.proxyList[Math.floor(Math.random() * this.proxyList.length)];
    }
    // bot/proxyHandler.js
const FreeProxy = require('free-proxy');

class ProxyHandler {
    constructor() {
        this.proxyList = [];
        this.freeProxy = new FreeProxy();
    }

    // Method untuk mendapatkan proxy gratis
    async loadFreeProxies() {
        try {
            console.log('🔄 Mengambil daftar proxy gratis...');
            
            // Ambil proxy dengan filter (opsional)
            const proxies = await this.freeProxy.getProxies({
                country: 'US',      // Filter negara
                protocol: 'http',   // Protocol
                limit: 50           // Jumlah proxy
            });
            
            this.proxyList = proxies.map(proxy => `${proxy.ip}:${proxy.port}`);
            console.log(`✅ Berhasil mengambil ${this.proxyList.length} proxy gratis`);
            
        } catch (error) {
            console.error('❌ Gagal mengambil proxy gratis:', error.message);
        }
    }

    // Method untuk mendapatkan proxy random
    getRandomProxy() {
        if (this.proxyList.length === 0) {
            return null;
        }
        const randomProxy = this.proxyList[Math.floor(Math.random() * this.proxyList.length)];
        return `http://${randomProxy}`;
    }

    // Method untuk test proxy
    async testProxy(proxyUrl) {
        try {
            const response = await fetch('https://httpbin.org/ip', {
                method: 'GET',
                agent: new (require('https-proxy-agent'))(proxyUrl),
                timeout: 10000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

module.exports = ProxyHandler;

    async testProxy(proxy) {
        // Test proxy connectivity
        try {
            // Implementation untuk test proxy
            return { working: true, speed: 100 };
        } catch (error) {
            return { working: false, error: error.message };
        }
    }
}
