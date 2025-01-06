import Keyv from 'keyv';
import type { IDataObject } from 'n8n-workflow';

interface ICacheConfig {
    enabled: boolean;
    ttl: number;
    size: number;
}

export class CacheService {
    private cache: Keyv | null = null;

    constructor(config: ICacheConfig) {
        if (config.enabled) {
            this.cache = new Keyv({
                ttl: config.ttl * 1000, // Convert to milliseconds
                maxSize: config.size,
                store: new Map(), // Use Map-based store for iteration support
            });
        }
    }

    private generateCacheKey(
        method: string,
        url: string,
        body?: IDataObject,
        qs?: IDataObject,
    ): string {
        return JSON.stringify({ method, url, body, qs });
    }

    private getResourcePattern(url: string): string {
        // Extract base resource pattern for invalidation
        // e.g., /products/123 -> /products
        return url.replace(/\/[^/]+$/, '');
    }

    async get<T>(
        method: string,
        url: string,
        body?: IDataObject,
        qs?: IDataObject,
    ): Promise<T | undefined> {
        if (!this.cache || method !== 'GET') {
            return undefined;
        }

        const key = this.generateCacheKey(method, url, body, qs);
        return this.cache.get(key) as Promise<T | undefined>;
    }

    async set<T>(
        method: string,
        url: string,
        data: T,
        body?: IDataObject,
        qs?: IDataObject,
    ): Promise<void> {
        if (!this.cache || method !== 'GET') {
            return;
        }

        const key = this.generateCacheKey(method, url, body, qs);
        await this.cache.set(key, data);

        // If this is a write operation, invalidate related cached entries
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            await this.invalidateResource(url);
        }
    }

    async invalidateResource(url: string): Promise<void> {
        if (!this.cache) {
            return;
        }

        const pattern = this.getResourcePattern(url);
        const store = this.cache.opts.store as Map<string, unknown>;
        
        // Iterate over Map keys
        for (const key of store.keys()) {
            try {
                const keyData = JSON.parse(key);
                if (keyData.url.startsWith(pattern)) {
                    await this.cache.delete(key);
                }
            } catch (error) {
                // Skip invalid keys
            }
        }
    }

    async delete(
        method: string,
        url: string,
        body?: IDataObject,
        qs?: IDataObject,
    ): Promise<void> {
        if (!this.cache) {
            return;
        }

        const key = this.generateCacheKey(method, url, body, qs);
        await this.cache.delete(key);
    }

    async clear(): Promise<void> {
        if (!this.cache) {
            return;
        }

        await this.cache.clear();
    }
} 