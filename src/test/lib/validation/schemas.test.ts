import { describe, it, expect } from "vitest";
import { chatRequestSchema, leadRequestSchema, ingestRequestSchema, courseInputSchema } from "@/lib/validation/schemas";

// ── chatRequestSchema ─────────────────────────────────────────────────────────

describe("chatRequestSchema", () => {
  const valid = { organizationSlug: "includo", message: "Ciao, cerco un corso" };

  it("passes with valid organizationSlug and message", () => {
    expect(chatRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when message is empty (after trim)", () => {
    expect(chatRequestSchema.safeParse({ ...valid, message: "   " }).success).toBe(false);
  });

  it("fails when message exceeds 2000 chars", () => {
    expect(chatRequestSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(false);
  });

  it("trims message before validation (leading/trailing spaces accepted)", () => {
    const result = chatRequestSchema.safeParse({ ...valid, message: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.message).toBe("hello");
  });

  it("fails when organizationSlug contains uppercase letters", () => {
    expect(chatRequestSchema.safeParse({ ...valid, organizationSlug: "Includo" }).success).toBe(false);
  });

  it("fails when organizationSlug contains spaces", () => {
    expect(chatRequestSchema.safeParse({ ...valid, organizationSlug: "my org" }).success).toBe(false);
  });

  it("fails when organizationSlug contains underscores", () => {
    expect(chatRequestSchema.safeParse({ ...valid, organizationSlug: "my_org" }).success).toBe(false);
  });

  it("passes when organizationSlug is lowercase alphanumeric with hyphens", () => {
    expect(chatRequestSchema.safeParse({ ...valid, organizationSlug: "my-org-123" }).success).toBe(true);
  });

  it("fails when organizationSlug exceeds 64 chars", () => {
    expect(chatRequestSchema.safeParse({ ...valid, organizationSlug: "a".repeat(65) }).success).toBe(false);
  });

  it("passes without optional conversationId", () => {
    expect(chatRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when conversationId is not a UUID", () => {
    expect(
      chatRequestSchema.safeParse({ ...valid, conversationId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("passes when conversationId is a valid UUID", () => {
    expect(
      chatRequestSchema.safeParse({
        ...valid,
        conversationId: "550e8400-e29b-41d4-a716-446655440000",
      }).success,
    ).toBe(true);
  });

  it("language field accepts 'it', 'en', 'fr'", () => {
    for (const lang of ["it", "en", "fr"] as const) {
      expect(chatRequestSchema.safeParse({ ...valid, language: lang }).success).toBe(true);
    }
  });

  it("fails for unknown language value", () => {
    expect(chatRequestSchema.safeParse({ ...valid, language: "de" }).success).toBe(false);
  });
});

// ── leadRequestSchema ─────────────────────────────────────────────────────────

describe("leadRequestSchema", () => {
  const valid = {
    organizationSlug: "includo",
    courseId: "550e8400-e29b-41d4-a716-446655440000",
    email: "test@example.com",
  };

  it("fails when email is absent", () => {
    const { email: _, ...withoutEmail } = valid;
    expect(leadRequestSchema.safeParse(withoutEmail).success).toBe(false);
  });

  it("fails when email is invalid format", () => {
    expect(leadRequestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("passes with valid email", () => {
    expect(leadRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("passes without optional fields (name, phone, message)", () => {
    expect(leadRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("courseId must be UUID format", () => {
    expect(leadRequestSchema.safeParse({ ...valid, courseId: "not-a-uuid" }).success).toBe(false);
  });
});

// ── ingestRequestSchema ───────────────────────────────────────────────────────

describe("ingestRequestSchema", () => {
  const validCourse = {
    externalRef: "course-001",
    title: "Corso di saldatura",
    description: "Impara a saldare professionalmente",
  };
  const valid = { organizationSlug: "includo", courses: [validCourse] };

  it("passes with valid courses array", () => {
    expect(ingestRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when courses array is empty", () => {
    expect(ingestRequestSchema.safeParse({ ...valid, courses: [] }).success).toBe(false);
  });

  it("fails when externalRef exceeds 128 chars", () => {
    const badCourse = { ...validCourse, externalRef: "a".repeat(129) };
    expect(ingestRequestSchema.safeParse({ ...valid, courses: [badCourse] }).success).toBe(false);
  });

  it("fails when externalRef is empty", () => {
    const badCourse = { ...validCourse, externalRef: "" };
    expect(ingestRequestSchema.safeParse({ ...valid, courses: [badCourse] }).success).toBe(false);
  });

  it("fails when skills array exceeds 50 items", () => {
    const badCourse = {
      ...validCourse,
      skills: Array.from({ length: 51 }, (_, i) => `skill-${i}`),
    };
    expect(ingestRequestSchema.safeParse({ ...valid, courses: [badCourse] }).success).toBe(false);
  });

  it("fails when courses array exceeds 200 items", () => {
    const courses = Array.from({ length: 201 }, (_, i) => ({
      ...validCourse,
      externalRef: `course-${i}`,
    }));
    expect(ingestRequestSchema.safeParse({ ...valid, courses }).success).toBe(false);
  });

  it("remote defaults to false when omitted", () => {
    const result = ingestRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.courses[0]!.remote).toBe(false);
  });

  it("skills defaults to [] when omitted", () => {
    const result = ingestRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.courses[0]!.skills).toEqual([]);
  });
});

// ── courseInputSchema ─────────────────────────────────────────────────────────

describe("courseInputSchema", () => {
  const valid = {
    externalRef: "c1",
    title: "Saldatura",
    description: "Corso professionale",
  };

  it("requires title, description, externalRef", () => {
    expect(courseInputSchema.safeParse(valid).success).toBe(true);
    expect(courseInputSchema.safeParse({ title: "T", description: "D" }).success).toBe(false);
  });

  it("fails when url is not a valid URL", () => {
    expect(courseInputSchema.safeParse({ ...valid, url: "not-a-url" }).success).toBe(false);
  });

  it("passes when url is omitted", () => {
    expect(courseInputSchema.safeParse(valid).success).toBe(true);
  });

  it("fails when a skill string exceeds 80 chars", () => {
    const badSkills = ["a".repeat(81)];
    expect(courseInputSchema.safeParse({ ...valid, skills: badSkills }).success).toBe(false);
  });
});
