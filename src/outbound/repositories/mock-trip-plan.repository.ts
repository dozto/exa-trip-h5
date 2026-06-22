import mockIndex from "../../mocks/trips/index.json";
import type { TripPlanRepository } from "../../features/load-trip-plan/port";

type TripMockIndex = Record<string, string>;

type TripJsonModule = {
  default: unknown;
};

const tripMockModules = import.meta.glob("/src/mocks/trips/*.json", {
  eager: true
}) as Record<string, TripJsonModule>;

const readMockByFileName = (fileName: string): unknown | null => {
  const key = `/src/mocks/trips/${fileName}`;
  const module = tripMockModules[key];
  return module?.default ?? null;
};

export class MockTripPlanRepository implements TripPlanRepository {
  private indexCache: TripMockIndex = mockIndex as TripMockIndex;

  async loadById(tripId: string): Promise<unknown | null> {
    const fileName = this.indexCache[tripId] ?? `${tripId}.json`;
    return readMockByFileName(fileName);
  }
}
