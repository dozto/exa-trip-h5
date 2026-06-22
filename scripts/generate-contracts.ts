import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { tripPlanSchema } from "../src/domains/trip-planning/trip-plan.schema";

const contract = zodToJsonSchema(tripPlanSchema, {
  name: "TripPlan",
  target: "jsonSchema2020-12",
  $refStrategy: "root"
});

contract.$schema = "https://json-schema.org/draft/2020-12/schema";
contract.$id = "https://exa-trip-h5.local/contracts/itinerary.v1.schema.json";

const outputPath = resolve(process.cwd(), "contracts/itinerary.v1.schema.json");
await writeFile(outputPath, `${JSON.stringify(contract, null, 2)}\n`, "utf8");

console.log(`[generate-contracts] wrote ${outputPath}`);
