import { z } from "zod";

export const tripCategorySchema = z.enum([
  "transport",
  "sightseeing",
  "food",
  "hotel",
  "free"
]);

export const preparationLevelSchema = z.enum(["must", "should", "optional"]);

export const suggestionTypeSchema = z.enum([
  "timing",
  "route",
  "safety",
  "packing",
  "food",
  "budget"
]);

export const suggestionPrioritySchema = z.enum(["high", "medium", "low"]);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

export const preparationItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: preparationLevelSchema,
  note: z.string().optional()
});

export const suggestionItemSchema = z.object({
  id: z.string().min(1),
  type: suggestionTypeSchema,
  content: z.string().min(1),
  priority: suggestionPrioritySchema
});

export const placeSchema = z.object({
  placeId: z.string().min(1),
  name: z.string().min(1),
  address: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  highlights: z.array(z.string()).optional(),
  tips: z.array(z.string()).optional()
});

export const itineraryItemSchema = z.object({
  itemId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  placeId: z.string().min(1).optional(),
  startTime: z.string().regex(timePattern).optional(),
  endTime: z.string().regex(timePattern).optional(),
  durationMinutes: z.number().int().min(1),
  category: tripCategorySchema.optional(),
  preparations: z.array(preparationItemSchema).optional(),
  suggestions: z.array(suggestionItemSchema).optional()
});

export const tripDaySchema = z.object({
  dayId: z.string().min(1),
  date: z.string().regex(datePattern),
  dayIndex: z.number().int().min(1),
  city: z.string().optional(),
  summary: z.string().optional(),
  items: z.array(itineraryItemSchema),
  preparations: z.array(preparationItemSchema).optional(),
  suggestions: z.array(suggestionItemSchema).optional()
});

export const tripPlanSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  tripId: z.string().min(1),
  title: z.string().min(1),
  timezone: z.string().min(1),
  startDate: z.string().regex(datePattern),
  endDate: z.string().regex(datePattern),
  days: z.array(tripDaySchema).min(1),
  places: z.record(placeSchema),
  globalPreparations: z.array(preparationItemSchema).optional(),
  globalSuggestions: z.array(suggestionItemSchema).optional()
});
