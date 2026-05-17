import { SetMetadata } from '@nestjs/common';

export type CooperativeScopeStrategy =
  | 'param'             // default: params.cooperativeId ?? params.id
  | 'query'             // query.cooperativeId
  | 'body'              // body.cooperativeId
  | 'derive-from-plot'; // :plotId param → resolve plot → sector → cooperative

export const COOPERATIVE_SCOPE_KEY = 'cooperative_scope';

/**
 * Overrides how PermissionGuard resolves the cooperativeId for a route.
 * Required when cooperativeId is not directly in route params.
 */
export const CooperativeScope = (strategy: CooperativeScopeStrategy) =>
  SetMetadata(COOPERATIVE_SCOPE_KEY, strategy);
