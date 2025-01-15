import type { MiddlewareFunction } from './OperationRegistry';

export namespace OperationMiddleware {
  export function logging(): MiddlewareFunction {
    return async (context, next) => {
      console.log(`[${context.resourceName}] Starting ${context.operationType} operation`);
      const startTime = Date.now();

      try {
        const result = await next(context);
        const duration = Date.now() - startTime;
        console.log(
          `[${context.resourceName}] Completed ${context.operationType} operation in ${duration}ms`,
        );
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(
          `[${context.resourceName}] Failed ${context.operationType} operation in ${duration}ms:`,
          error,
        );
        throw error;
      }
    };
  }

  export function validation(validate: (params: unknown) => Promise<boolean>): MiddlewareFunction {
    return async (context, next) => {
      if (!(await validate(context.params))) {
        return {
          success: false,
          error: new Error('Validation failed'),
        };
      }
      return next(context);
    };
  }

  export function timeout(timeoutMs: number): MiddlewareFunction {
    return async (context, next) => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      return Promise.race([next(context), timeoutPromise]);
    };
  }

  export function retry(attempts: number, delay: number): MiddlewareFunction {
    return async (context, next) => {
      let lastError: Error | undefined;

      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await next(context);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error during retry');
          if (attempt === attempts) break;
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }

      return {
        success: false,
        error: lastError,
      };
    };
  }

  export function caching(ttlMs: number): MiddlewareFunction {
    const cache = new Map<string, { data: unknown; expires: number }>();

    return async (context, next) => {
      if (context.operationType !== 'get') {
        return next(context);
      }

      const cacheKey = `${context.resourceName}:${JSON.stringify(context.params)}`;
      const cached = cache.get(cacheKey);
      const now = Date.now();

      if (cached && cached.expires > now) {
        return {
          success: true,
          data: cached.data,
          metadata: { cached: true },
        };
      }

      const result = await next(context);
      if (result.success) {
        cache.set(cacheKey, {
          data: result.data,
          expires: now + ttlMs,
        });
      }

      return result;
    };
  }

  export function metrics(): MiddlewareFunction {
    const metrics = new Map<string, { count: number; totalTime: number; errors: number }>();

    return async (context, next) => {
      const key = `${context.resourceName}:${context.operationType}`;
      const startTime = Date.now();

      try {
        const result = await next(context);
        const duration = Date.now() - startTime;

        const current = metrics.get(key) ?? { count: 0, totalTime: 0, errors: 0 };
        metrics.set(key, {
          count: current.count + 1,
          totalTime: current.totalTime + duration,
          errors: current.errors + (result.success ? 0 : 1),
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        const current = metrics.get(key) ?? { count: 0, totalTime: 0, errors: 0 };
        metrics.set(key, {
          count: current.count + 1,
          totalTime: current.totalTime + duration,
          errors: current.errors + 1,
        });
        throw error;
      }
    };
  }
}
