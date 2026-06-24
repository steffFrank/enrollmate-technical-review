/*
 * IncluDO AI Platform
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 */

/** All roles in the platform. Stored in app_metadata or org_memberships. */
export enum Role {
  /** SaaS owner. Set via app_metadata.platform_role on auth.users (service role only). */
  PLATFORM_ADMIN = "platform_admin",
  /** Full control of one organization (courses, leads, members, settings). */
  ORG_ADMIN = "org_admin",
  /** Can manage admissions leads and view conversations/analytics. */
  ADMISSIONS_AGENT = "admissions_agent",
  /** Read-only access to one organization's dashboard. */
  ORG_MEMBER = "org_member",
}

/** Platform-level roles that bypass org scoping. */
export const PLATFORM_ROLES: Role[] = [Role.PLATFORM_ADMIN];

/** Roles that inherit org_member access (hierarchy: admin ⊇ member). */
export const ORG_ADMIN_LIKE_ROLES: Role[] = [Role.ORG_ADMIN];

export const ORG_READ_ROLES: Role[] = [
  Role.ORG_ADMIN,
  Role.ADMISSIONS_AGENT,
  Role.ORG_MEMBER,
];

export const ADMISSIONS_ROLES: Role[] = [Role.ORG_ADMIN, Role.ADMISSIONS_AGENT];
