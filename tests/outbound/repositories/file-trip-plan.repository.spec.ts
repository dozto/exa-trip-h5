import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FileTripPlanRepository } from "../../../src/outbound/repositories/file-trip-plan.repository";

const tempDirs: string[] = [];

const createTempDir = async (): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), "exa-trip-h5-"));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("FileTripPlanRepository", () => {
  it("loads trip JSON from mapped file path", async () => {
    const rootDir = await createTempDir();
    const relativePath = "trip.json";
    const absolutePath = join(rootDir, relativePath);

    await writeFile(
      absolutePath,
      JSON.stringify({
        tripId: "trip-a"
      }),
      "utf8"
    );

    const repository = new FileTripPlanRepository(rootDir, {
      "trip-a": relativePath
    });

    const data = await repository.loadById("trip-a");

    expect(data).toMatchObject({ tripId: "trip-a" });
  });

  it("returns null when trip id is not mapped", async () => {
    const rootDir = await createTempDir();
    const repository = new FileTripPlanRepository(rootDir, {});

    const data = await repository.loadById("unknown");

    expect(data).toBeNull();
  });

  it("throws when mapped file does not exist", async () => {
    const rootDir = await createTempDir();
    const repository = new FileTripPlanRepository(rootDir, {
      "trip-a": "missing.json"
    });

    await expect(repository.loadById("trip-a")).rejects.toThrow();
  });

  it("throws when mapped file contains invalid JSON", async () => {
    const rootDir = await createTempDir();
    const relativePath = "invalid.json";
    const absolutePath = join(rootDir, relativePath);
    await writeFile(absolutePath, "{ not-valid-json", "utf8");

    const repository = new FileTripPlanRepository(rootDir, {
      "trip-a": relativePath
    });

    await expect(repository.loadById("trip-a")).rejects.toThrow();
  });
});
