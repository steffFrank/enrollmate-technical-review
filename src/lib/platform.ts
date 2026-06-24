/*
 * EnrollMate
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 * Proprietary and confidential. Unauthorized use, copying, modification,
 * or distribution of this file is prohibited. See LICENSE.
 */

/**
 * SaaS platform (vendor) brand — distinct from the per-organization brand.
 * The platform identity is fixed and lives as static assets in /public/brand.
 * Organizations bring their own logo via `organizations.logo_url`.
 */
export const PLATFORM = {
  name: "EnrollMate",
  /** Platform accent (green); used to theme SaaS-owned surfaces. */
  color: "#065F46",
  /** Full lockup, 260x56. */
  logo: "/brand/enrollmate-logo.svg",
  logoWidth: 260,
  logoHeight: 56,
  /** Square mark, 64×64. */
  mark: "/brand/enrollmate-mark.svg",
} as const;
