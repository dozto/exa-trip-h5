import { describe, expect, it, vi } from "vitest";
import { MapboxRoutingGateway } from "../../../src/outbound/gateways/mapbox-routing.gateway";

const from = {
  placeId: "place-a",
  name: "A",
  lat: 35.6812,
  lng: 139.7671
};

const to = {
  placeId: "place-b",
  name: "B",
  lat: 35.6895,
  lng: 139.6917
};

describe("MapboxRoutingGateway", () => {
  it("maps directions response to routing result", async () => {
    let lastRequestedUrl = "";
    const fetchSpy = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          routes: [
            {
              distance: 12345,
              duration: 2100,
              geometry: {
                type: "LineString",
                coordinates: [
                  [139.7671, 35.6812],
                  [139.6917, 35.6895]
                ]
              }
            }
          ]
        }),
        { status: 200 }
      );
    });
    const fetcher = ((input: URL | RequestInfo, init?: RequestInit) => {
      lastRequestedUrl = String(input);
      return fetchSpy();
    }) as typeof fetch;

    const gateway = new MapboxRoutingGateway({
      accessToken: "token-123",
      fetcher
    });

    const result = await gateway.planRoute({
      from,
      to,
      mode: "drive",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result).toEqual({
      mode: "drive",
      distanceKm: 12.3,
      durationMinutes: 35,
      geometry: [
        [139.7671, 35.6812],
        [139.6917, 35.6895]
      ]
    });

    expect(lastRequestedUrl).toContain("api.mapbox.com/directions/v5/mapbox/driving");
    expect(lastRequestedUrl).toContain("access_token=token-123");
  });

  it("throws error when coordinates are missing", async () => {
    const gateway = new MapboxRoutingGateway({ accessToken: "token-123" });

    await expect(
      gateway.planRoute({
        from: {
          placeId: "place-a",
          name: "A"
        },
        to,
        mode: "walk",
        departureTime: "2026-07-01T08:00:00.000Z"
      })
    ).rejects.toThrow("Mapbox route requires coordinates");
  });

  it("requests alternatives and picks the fastest route when strategy=fastest", async () => {
    let requestedUrl = "";
    const fetcher = ((input: URL | RequestInfo) => {
      requestedUrl = String(input);
      return Promise.resolve(
        new Response(
          JSON.stringify({
            routes: [
              { distance: 12000, duration: 1200, geometry: { coordinates: [[0, 0], [1, 1]] } },
              { distance: 10000, duration: 1500, geometry: { coordinates: [[0, 0], [2, 2]] } }
            ]
          }),
          { status: 200 }
        )
      );
    }) as typeof fetch;

    const gateway = new MapboxRoutingGateway({ accessToken: "t", fetcher });
    const result = await gateway.planRoute({
      from,
      to,
      mode: "drive",
      strategy: "fastest",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result.strategy).toBe("fastest");
    expect(result.durationMinutes).toBe(20);
    expect(requestedUrl).toContain("alternatives=true");
  });

  it("uses the native fetch (bound to globalThis) by default without Illegal invocation", async () => {
  const fetchSpy = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [{ distance: 1000, duration: 60, geometry: { coordinates: [[0, 0], [1, 1]] } }]
        }),
        { status: 200 }
      )
    );

  const gateway = new MapboxRoutingGateway({ accessToken: "t" });
  const result = await gateway.planRoute({
    from,
    to,
    mode: "drive",
    departureTime: "2026-07-01T08:00:00.000Z"
  });

  expect(result.durationMinutes).toBe(1);
  expect(fetchSpy).toHaveBeenCalled();

  fetchSpy.mockRestore();
});

it("picks the shortest distance route when strategy=cheapest", async () => {
    const fetcher = (async () => {
      return new Response(
        JSON.stringify({
          routes: [
            { distance: 12000, duration: 1200, geometry: { coordinates: [[0, 0], [1, 1]] } },
            { distance: 9000, duration: 1800, geometry: { coordinates: [[0, 0], [2, 2]] } }
          ]
        }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const gateway = new MapboxRoutingGateway({ accessToken: "t", fetcher });
    const result = await gateway.planRoute({
      from,
      to,
      mode: "drive",
      strategy: "cheapest",
      departureTime: "2026-07-01T08:00:00.000Z"
    });

    expect(result.distanceKm).toBe(9);
  });
});
