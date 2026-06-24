/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 * Proprietary and confidential. Unauthorized use, copying, modification,
 * or distribution of this file is prohibited. See LICENSE.
 */
import { z } from "zod";

/** Shared Zod schemas. Every API route validates its input through these. */

export const languageSchema = z.enum(["it", "en", "fr"]);
export const deliveryModeSchema = z.enum(["on_site", "remote", "hybrid"]);
export const enrollmentStatusSchema = z.enum(["open", "waitlist", "closed"]);
export const leadStatusSchema = z.enum(["new", "contacted", "qualified", "applied", "enrolled", "lost"]);
export const leadKindSchema = z.enum(["inquiry", "handoff"]);

export const attributionSchema = z.object({
  sourceChannel: z.enum(["hosted", "widget", "api"]).default("hosted"),
  landingUrl: z.string().url().max(1000).optional(),
  referrer: z.string().url().max(1000).optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
});

const optionalDateSchema = z.string().date().optional().or(z.literal(""));
const stringListSchema = z.array(z.string().trim().min(1).max(200)).max(50).default([]);

/** POST /api/chat */
export const chatRequestSchema = z.object({
  organizationSlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Invalid organization slug"),
  // Anonymous conversation id (client-generated UUID stored in localStorage/cookie).
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1, "Message is required").max(2000),
  // Optional language hint from the UI selector; LLM still auto-detects from message content.
  language: languageSchema.optional(),
  attribution: attributionSchema.optional(),
});
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** A single course in the ingestion payload. */
export const courseInputSchema = z.object({
  externalRef: z.string().min(1).max(128),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  duration: z.string().max(100).optional(),
  remote: z.boolean().default(false),
  deliveryMode: deliveryModeSchema.optional(),
  skills: z.array(z.string().min(1).max(80)).max(50).default([]),
  language: z.string().max(20).optional(),
  url: z.string().url().optional(),
  locationName: z.string().max(200).optional(),
  locationCity: z.string().max(120).optional(),
  locationRegion: z.string().max(120).optional(),
  locationCountryCode: z.string().trim().length(2).toUpperCase().optional(),
  scheduleSummary: z.string().max(500).optional(),
  weeklyCommitmentHours: z.number().min(0).max(168).optional(),
  startDate: optionalDateSchema,
  applicationDeadline: optionalDateSchema,
  tuitionCents: z.number().int().min(0).optional(),
  tuitionCurrency: z.string().trim().length(3).toUpperCase().optional(),
  fundingOptions: stringListSchema,
  eligibility: stringListSchema,
  prerequisites: stringListSchema,
  outcomes: stringListSchema,
  qualification: z.string().max(300).optional(),
  enrollmentStatus: enrollmentStatusSchema.default("open"),
});
export type CourseInput = z.infer<typeof courseInputSchema>;

/** Pilot ingestion script and future authenticated course-management input. */
export const ingestRequestSchema = z.object({
  organizationSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  courses: z.array(courseInputSchema).min(1).max(200),
});
export type IngestRequest = z.infer<typeof ingestRequestSchema>;

/** Structured profile fields the LLM may extract (all optional, never invented). */
export const profileUpdateSchema = z.object({
  preferredLanguage: z.string().max(20).nullable().optional(),
  studyMode: z.string().max(40).nullable().optional(),
  availability: z.string().max(120).nullable().optional(),
  interests: z.array(z.string().min(1).max(80)).max(30).optional(),
  goals: z.string().max(300).nullable().optional(),
  experienceLevel: z.string().max(60).nullable().optional(),
  preferredDuration: z.string().max(60).nullable().optional(),
});
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/** POST /api/leads — anonymous lead capture from the course card CTA. */
export const leadRequestSchema = z.object({
  organizationSlug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  courseId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
  name: z.string().max(200).optional(),
  email: z.string().email("Email non valida").max(200),
  phone: z.string().max(50).optional(),
  message: z.string().max(500).optional(),
  kind: leadKindSchema.default("inquiry"),
  handoffReason: z.string().max(80).optional(),
  sourceChannel: z.enum(["hosted", "widget", "api"]).default("hosted"),
  widgetSessionToken: z.string().min(32).max(256).optional(),
  widgetPublicKey: z.string().min(12).max(128).optional(),
  parentOrigin: z.string().url().optional(),
  privacyAcknowledged: z.boolean().default(false),
  marketingConsent: z.boolean().default(false),
});
export type LeadRequest = z.infer<typeof leadRequestSchema>;

// ---------------------------------------------------------------------------
// Phase 2.1 — Dashboard course management
// ---------------------------------------------------------------------------

/** Shared editable course fields used by both create and update. */
const courseFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: z.string().trim().min(1, "Description is required.").max(2000),
  duration: z.string().trim().max(100).optional().or(z.literal("")),
  remote: z.boolean().default(false),
  deliveryMode: deliveryModeSchema.default("on_site"),
  skills: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  language: z.string().trim().max(20).optional().or(z.literal("")),
  url: z.string().trim().url("Must be a valid URL.").max(500).optional().or(z.literal("")),
  locationName: z.string().trim().max(200).optional().or(z.literal("")),
  locationCity: z.string().trim().max(120).optional().or(z.literal("")),
  locationRegion: z.string().trim().max(120).optional().or(z.literal("")),
  locationCountryCode: z.string().trim().max(2).optional().or(z.literal("")),
  scheduleSummary: z.string().trim().max(500).optional().or(z.literal("")),
  weeklyCommitmentHours: z.number().min(0).max(168).nullable().optional(),
  startDate: optionalDateSchema,
  applicationDeadline: optionalDateSchema,
  tuitionCents: z.number().int().min(0).nullable().optional(),
  tuitionCurrency: z.string().trim().max(3).optional().or(z.literal("")),
  fundingOptions: stringListSchema,
  eligibility: stringListSchema,
  prerequisites: stringListSchema,
  outcomes: stringListSchema,
  qualification: z.string().trim().max(300).optional().or(z.literal("")),
  enrollmentStatus: enrollmentStatusSchema.default("open"),
});

/** Create a course from the dashboard. */
export const courseCreateSchema = courseFieldsSchema.extend({
  organizationId: z.string().uuid(),
});
export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

/** Update an existing course. */
export const courseUpdateSchema = courseFieldsSchema.extend({
  organizationId: z.string().uuid(),
  courseId: z.string().uuid(),
});
export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

/** Toggle a course's active state (soft delete / restore). */
export const courseToggleSchema = z.object({
  organizationId: z.string().uuid(),
  courseId: z.string().uuid(),
  isActive: z.boolean(),
});
export type CourseToggleInput = z.infer<typeof courseToggleSchema>;

// ---------------------------------------------------------------------------
// Phase 2.1 — Organization settings
// ---------------------------------------------------------------------------

export const orgSettingsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required.").max(120),
  brandColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Must be a 6-digit hex color, e.g. #4f46e5."),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  welcomeMessage: z.string().trim().max(1000).optional().or(z.literal("")),
  assistantContext: z.string().trim().max(2000).optional().or(z.literal("")),
  schedulingUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  privacyPolicyUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  handoffEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  handoffMessage: z.string().trim().max(500).optional().or(z.literal("")),
  handoffEnabled: z.boolean().default(true),
  widgetEnabled: z.boolean().default(false),
  widgetAllowedOrigins: z.array(z.string().url().refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && value === url.origin;
  }, "Use an exact HTTPS origin, for example https://www.example.org.")).max(20).default([]),
  widgetPosition: z.enum(["bottom-right", "bottom-left"]).default("bottom-right"),
  marketingConsentEnabled: z.boolean().default(false),
  escalationSimilarityThreshold: z.number().min(0.3).max(0.95).default(0.45),
  escalationTopics: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  conversationRetentionDays: z.number().int().min(30).max(3650).default(180),
  leadRetentionDays: z.number().int().min(30).max(3650).default(730),
});
export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;

// ---------------------------------------------------------------------------
// Phase 2.2 — Member management (org-scoped roster)
// ---------------------------------------------------------------------------

/** Org-scoped roles assignable from the dashboard (excludes platform_admin). */
export const orgRoleSchema = z.enum(["org_admin", "admissions_agent", "org_member"]);
export type OrgRole = z.infer<typeof orgRoleSchema>;

/** Invite (or attach) a member to an organization by email. */
export const memberInviteSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  role: orgRoleSchema,
});
export type MemberInviteInput = z.infer<typeof memberInviteSchema>;

/** Change an existing member's role. */
export const memberRoleUpdateSchema = z.object({
  organizationId: z.string().uuid(),
  membershipId: z.string().uuid(),
  role: orgRoleSchema,
});
export type MemberRoleUpdateInput = z.infer<typeof memberRoleUpdateSchema>;

/** Remove a member from an organization. */
export const memberRemoveSchema = z.object({
  organizationId: z.string().uuid(),
  membershipId: z.string().uuid(),
});
export type MemberRemoveInput = z.infer<typeof memberRemoveSchema>;

// ---------------------------------------------------------------------------
// Phase 2.2 — Platform admin (cross-org management)
// ---------------------------------------------------------------------------

/** Create a new organization (platform admin only). */
export const orgCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug must be at least 2 characters.")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  brandColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Must be a 6-digit hex color, e.g. #4f46e5.")
    .optional()
    .or(z.literal("")),
});
export type OrgCreateInput = z.infer<typeof orgCreateSchema>;

/** Suspend or reactivate an organization (platform admin only). */
export const orgStatusSchema = z.object({
  organizationId: z.string().uuid(),
  status: z.enum(["active", "suspended"]),
});
export type OrgStatusInput = z.infer<typeof orgStatusSchema>;
