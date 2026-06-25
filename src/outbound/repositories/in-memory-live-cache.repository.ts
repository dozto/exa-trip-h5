import type { NavigationPlan } from "../../domains/trip-navigation/route-plan";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class InMemoryLiveCacheRepository {
  private readonly navigationPlanMap = new Map<string, CacheEntry<NavigationPlan>>();

  private isExpired(expiresAt: number): boolean {
    return Date.now() > expiresAt;
  }

  async getNavigationPlan(cacheKey: string): Promise<NavigationPlan | null> {
    const entry = this.navigationPlanMap.get(cacheKey);
    if (!entry || this.isExpired(entry.expiresAt)) {
      this.navigationPlanMap.delete(cacheKey);
      return null;
    }

    return entry.value;
  }

  async setNavigationPlan(cacheKey: string, value: NavigationPlan, ttlSeconds: number): Promise<void> {
    this.navigationPlanMap.set(cacheKey, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
}
