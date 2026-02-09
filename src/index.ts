import { getServiceFactory } from './di/ServiceFactory';
import type { Env } from './infrastructure/types/Env';
import { handleRequest } from './presentation/router';

export default {
  /**
   * Cloudflare Workers fetch handler.
   *
   * @param request - The incoming HTTP request
   * @param env - Cloudflare Workers environment bindings
   * @returns The HTTP response
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const factory = getServiceFactory(env);
    return handleRequest(request, {
      authHandlers: factory.authHandlers,
      getCurrentUserUseCase: factory.getCurrentUserUseCase,
      cookieOptions: factory.cookieOptions,
      logger: factory.logger,
    });
  },
};
