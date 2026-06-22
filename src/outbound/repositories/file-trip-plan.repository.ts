import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { TripPlanRepository } from "../../features/load-trip-plan/port";

type TripFileIndex = Record<string, string>;

export class FileTripPlanRepository implements TripPlanRepository {
  constructor(
    private readonly dataRootDir: string,
    private readonly index: TripFileIndex
  ) {}

  async loadById(tripId: string): Promise<unknown | null> {
    const relativePath = this.index[tripId];
    if (!relativePath) {
      return null;
    }

    const absolutePath = resolve(this.dataRootDir, relativePath);
    const content = await readFile(absolutePath, "utf8");
    return JSON.parse(content) as unknown;
  }
}
