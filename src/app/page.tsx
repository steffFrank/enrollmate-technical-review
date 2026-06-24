/*
 * EnrollMate
 * Copyright (c) 2026 Steff (steffFrank). All rights reserved.
 *
 * SaaS marketing landing page - EnrollMate.
 */
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Globe2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { PLATFORM } from "@/lib/platform";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { LANDING_COPY } from "@/lib/landing-i18n";
import { getAppLocale } from "@/lib/app-i18n.server";
import { isSelfServiceSignupEnabled } from "@/lib/auth/self-service";

export const metadata = {
  title: "EnrollMate - AI enrolment concierge for training organisations",
  description:
    "Give every student a multilingual AI enrolment concierge. Recommend the right programme, capture qualified leads, and measure enrolment demand.",
};

const SALES_HREF = process.env.SALES_CONTACT_URL ?? "mailto:sales@enrollmate.ai";
type LandingCopy = (typeof LANDING_COPY)["en"];
const FEATURE_LAYOUT = [
  { icon: Bot, className: "lg:col-span-2" },
  { icon: Globe2, className: "" },
  { icon: Users, className: "" },
  { icon: BarChart3, className: "lg:col-span-2" },
];
const STEP_ICONS = [BookOpen, MessageCircle, Users];
const PLAN_CONFIG = [
  { name: "implementation", priceCents: 0, highlighted: false },
  { name: "pilot", priceCents: 30000, highlighted: true },
];

function NavBar({ copy, signupEnabled }: { copy: LandingCopy; signupEnabled: boolean }) {
  const primaryHref = signupEnabled ? "/auth/register" : SALES_HREF;
  const primaryLabel = signupEnabled ? copy.trialCta : copy.bookPilot;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={copy.home}
        >
          <Image
            src={PLATFORM.logo}
            alt={PLATFORM.name}
            width={PLATFORM.logoWidth}
            height={PLATFORM.logoHeight}
            className="h-7 w-auto dark:brightness-200"
            unoptimized
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#product" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {copy.nav[0]}
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {copy.nav[1]}
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {copy.nav[2]}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact className="hidden lg:inline-flex" />
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href="/auth/login"
            className="hidden text-sm font-semibold text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            {copy.signIn}
          </Link>
          <a
            href={primaryHref}
            className={cn(buttonVariants(), "rounded-full px-5 transition-transform hover:-translate-y-0.5")}
          >
            {primaryLabel} <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroVisual({ copy }: { copy: LandingCopy }) {
  return (
    <div className="landing-reveal landing-delay-2 relative mx-auto w-full max-w-[620px] lg:mx-0">
      <div className="landing-float absolute -left-5 top-14 z-20 hidden rounded-2xl border border-border bg-card/95 p-3.5 shadow-2xl shadow-primary/15 backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">{copy.visual.ready}</p>
            <p className="text-sm font-bold text-foreground">{copy.visual.matchFound}</p>
          </div>
        </div>
      </div>

      <div className="relative aspect-[4/4.35] overflow-hidden rounded-[2rem] bg-primary-strong shadow-2xl shadow-primary/20 sm:aspect-[5/4.4] lg:aspect-[4/4.35]">
        <Image
          src="/images/enrollmate-advising.png"
          alt={copy.visual.alt}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 46vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-strong/90 via-primary-strong/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-strong-foreground/20 bg-primary-strong-foreground/10 px-3 py-1 text-[11px] font-semibold text-primary-strong-foreground backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" />
            {copy.visual.live}
          </div>
          <p className="max-w-sm text-xl font-semibold leading-snug text-primary-strong-foreground sm:text-2xl">
            {copy.visual.clear}
          </p>
        </div>
      </div>

      <div className="landing-float-slow absolute bottom-[-100px] right-3 z-20 w-[min(88%,360px)] rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-primary/15 sm:-right-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{copy.visual.top}</p>
            <p className="mt-1 text-sm font-bold text-foreground">Digital Craft &amp; Design</p>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">{copy.visual.weeks}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {copy.visual.reason}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{copy.visual.onSite}</span>
          <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground">{copy.visual.beginner}</span>
        </div>
      </div>
    </div>
  );
}

function ProductPreview({ copy }: { copy: LandingCopy }) {
  const bars = [35, 48, 42, 60, 54, 74, 68, 82, 70, 92, 78, 100];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-primary/15">
      <div className="flex h-12 items-center justify-between border-b border-border bg-secondary/80 px-4 sm:px-5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-destructive/50" />
          <span className="size-2.5 rounded-full bg-accent-strong" />
          <span className="size-2.5 rounded-full bg-success" />
        </div>
        <div className="rounded-md border border-border bg-card px-5 py-1 text-[10px] font-medium text-muted-foreground sm:px-12">
          advisor.your-school.org
        </div>
        <div className="w-10" />
      </div>

      <div className="grid min-h-[510px] lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col bg-secondary">
          <div className="flex items-center justify-between border-b border-border/80 bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">N</div>
              <div>
                <p className="text-sm font-bold text-foreground">Northstar Academy</p>
                <p className="text-[10px] text-muted-foreground">{copy.preview.advisor}</p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">{copy.preview.online}</span>
          </div>

          <div className="flex-1 space-y-4 p-5 sm:p-7">
            <div className="flex max-w-[82%] items-start gap-2.5">
              <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">N</div>
              <div className="rounded-[4px_16px_16px_16px] border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground shadow-sm">
                {copy.preview.assistant}
              </div>
            </div>

            <div className="ml-auto max-w-[76%] rounded-[16px_4px_16px_16px] bg-primary px-4 py-3 text-xs leading-relaxed text-primary-foreground">
              {copy.preview.student}
            </div>

            <div className="flex max-w-[92%] items-start gap-2.5">
              <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">N</div>
              <div className="space-y-3">
                <div className="rounded-[4px_16px_16px_16px] border border-border bg-card px-4 py-3 text-xs leading-relaxed text-muted-foreground shadow-sm">
                  {copy.preview.fit}
                </div>
                <div className="rounded-2xl border border-primary/10 bg-card p-4 shadow-lg shadow-primary/5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">Digital Craft &amp; Design</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">{copy.preview.practical}</span>
                        <span className="rounded-md bg-secondary px-2 py-1 text-[9px] font-semibold text-muted-foreground">{copy.visual.weeks}</span>
                        <span className="rounded-md bg-secondary px-2 py-1 text-[9px] font-semibold text-muted-foreground">{copy.visual.beginner}</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-[9px] font-bold text-accent-foreground">
                      <Sparkles className="size-2.5" /> {copy.preview.match}
                    </span>
                  </div>
                  <div className="mt-3 rounded-lg bg-secondary p-3 text-[10px] leading-relaxed text-muted-foreground">
                    {copy.preview.why}
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-primary-foreground">
                    {copy.preview.request} <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden border-l border-border bg-card p-5 lg:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{copy.preview.liveOverview}</p>
              <p className="mt-1 text-sm font-bold text-foreground">{copy.preview.demand}</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="size-4" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-[9px] font-semibold text-muted-foreground">{copy.preview.conversations}</p>
              <p className="mt-1 text-xl font-bold text-foreground">248</p>
              <p className="text-[9px] font-semibold text-primary">{copy.preview.month}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-[9px] font-semibold text-muted-foreground">{copy.preview.leads}</p>
              <p className="mt-1 text-xl font-bold text-foreground">37</p>
              <p className="text-[9px] font-semibold text-primary">{copy.preview.measured}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-border p-3.5">
            <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground">
              <span>{copy.preview.trend}</span>
              <span>{copy.preview.days}</span>
            </div>
            <div className="mt-5 flex h-24 items-end gap-1.5" aria-label={copy.preview.chart}>
              {bars.map((height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t bg-primary/80"
                  style={{ height: height + "%", opacity: 0.35 + index * 0.045 }}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold text-foreground">{copy.preview.interests}</p>
            <div className="mt-3 space-y-3">
              {[
                [copy.preview.interestItems[0], "78%"],
                [copy.preview.interestItems[1], "64%"],
                [copy.preview.interestItems[2], "51%"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-[9px] font-medium text-muted-foreground">
                    <span>{label}</span><span>{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-accent-strong" style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const locale = await getAppLocale();
  const copy = LANDING_COPY[locale];
  const signupEnabled = isSelfServiceSignupEnabled();
  const primaryHref = signupEnabled ? "/auth/register" : SALES_HREF;
  const primaryLabel = signupEnabled ? copy.trialCta : copy.managedPilot;

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <NavBar copy={copy} signupEnabled={signupEnabled} />

      <section className="relative px-5 pb-28 pt-16 sm:px-8 sm:pb-36 sm:pt-24 lg:pt-28">
        <div className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -left-40 top-16 size-[520px] rounded-full bg-accent/50 blur-[110px]" />
        <div className="pointer-events-none absolute -right-52 top-0 size-[620px] rounded-full bg-primary-soft/70 blur-[130px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
          <div className="max-w-2xl">
            <div className="landing-reveal inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur">
              <Sparkles className="size-3.5 text-accent-foreground" aria-hidden />
              {copy.heroBadge}
            </div>

            <h1 className="landing-reveal landing-delay-1 mt-7 text-balance text-[2.75rem] font-bold leading-[1.04] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-[4.35rem]">
              {copy.heroBefore}{" "}
              <span className="relative text-primary">
                {copy.heroAccent}
                <span className="absolute -bottom-1 left-0 -z-10 h-2 w-full -rotate-1 rounded-full bg-accent-strong/60" />
              </span>
            </h1>

            <p className="landing-reveal landing-delay-2 mt-7 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {copy.heroBody}
            </p>

            <div className="landing-reveal landing-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={primaryHref}
                className={cn(buttonVariants({ size: "lg" }), "group h-12 rounded-full px-7 font-bold transition-transform hover:-translate-y-0.5")}
              >
                {primaryLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
              <Link
                href="/o/includo/chat"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-full bg-card/75 px-7 font-bold backdrop-blur transition-transform hover:-translate-y-0.5")}
              >
                <MessageCircle className="size-4 text-primary" aria-hidden />
                {copy.tryAdvisor}
              </Link>
            </div>

            <div className="landing-reveal landing-delay-4 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-muted-foreground">
              {copy.heroChecks.map((item) => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" /> {item}</span>)}
            </div>
          </div>

          <HeroVisual copy={copy} />
        </div>
      </section>

      <section className="border-y border-border bg-card/70 px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {copy.capabilities.map((capability) => (
            <div key={capability} className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Check className="size-3.5" aria-hidden />
              </span>
              {capability}
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="relative px-5 py-24 sm:px-8 sm:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-soft/50 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{copy.journeyEyebrow}</p>
            <h2 className="mt-4 text-balance text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
              {copy.journeyTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {copy.journeyBody}
            </p>
          </div>
          <ProductPreview copy={copy} />
        </div>
      </section>

      <section id="how-it-works" className="bg-primary-strong px-5 py-24 text-primary-strong-foreground sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-strong">{copy.simpleEyebrow}</p>
              <h2 className="mt-4 max-w-lg text-3xl font-bold tracking-[-0.035em] sm:text-5xl">
                {copy.simpleTitle}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-primary-strong-foreground/65 lg:justify-self-end">
              {copy.simpleBody}
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[1.75rem] border border-primary-strong-foreground/10 bg-primary-strong-foreground/10 lg:grid-cols-3">
            {copy.steps.map((step, index) => {
              const StepIcon = STEP_ICONS[index]!;
              return <article key={index} className="group relative bg-primary-strong p-7 transition-colors hover:bg-primary/70 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent-strong">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex size-10 items-center justify-center rounded-xl border border-primary-strong-foreground/10 bg-primary-strong-foreground/5 text-primary-strong-foreground/80 transition-transform group-hover:-translate-y-1">
                    <StepIcon className="size-5" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-12 text-xl font-bold">{step[0]}</h3>
                <p className="mt-3 text-sm leading-6 text-primary-strong-foreground/60">{step[1]}</p>
                <ChevronRight className="mt-8 size-5 text-accent-strong transition-transform group-hover:translate-x-1" aria-hidden />
              </article>;
            })}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{copy.teamsEyebrow}</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                {copy.teamsTitle}
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">
              {copy.teamsBody}
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {copy.features.map((feature, index) => {
              const FeatureIcon = FEATURE_LAYOUT[index]!.icon;
              return (
              <article
                key={feature[1]}
                className={[
                  "group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 sm:p-8",
                  FEATURE_LAYOUT[index]!.className,
                ].join(" ")}
              >
                <div className="absolute -right-12 -top-12 size-36 rounded-full bg-primary-soft/60 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                <div className="relative">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/10">
                    <FeatureIcon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.17em] text-primary">{feature[0]}</p>
                  <h3 className="mt-2 max-w-xl text-xl font-bold leading-snug tracking-[-0.02em] text-foreground sm:text-2xl">{feature[1]}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{feature[2]}</p>
                </div>
              </article>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <article className="rounded-[1.5rem] border border-border bg-accent p-7 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-strong/25 text-accent-foreground"><Code2 className="size-5" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-accent-foreground">{copy.integration[0]}</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{copy.integration[1]}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.integration[2]}</p>
                </div>
              </div>
            </article>
            <article className="rounded-[1.5rem] border border-border bg-primary-soft p-7 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-primary">{copy.access[0]}</p>
                  <h3 className="mt-2 text-xl font-bold text-foreground">{copy.access[1]}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.access[2]}</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-border bg-card px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{copy.pricingEyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">{copy.pricingTitle}</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{copy.pricingBody}</p>
          </div>

          <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-2">
            {PLAN_CONFIG.map((config, index) => {
              const plan = { ...config, ...copy.plans[index]! };
              return (
              <article
                key={plan.name}
                className={
                  plan.highlighted
                    ? "relative flex flex-col rounded-[1.75rem] border border-primary bg-primary-strong p-7 text-primary-strong-foreground shadow-2xl shadow-primary/20 sm:p-8 lg:-translate-y-3"
                    : "relative flex flex-col rounded-[1.75rem] border border-border bg-background p-7 text-foreground sm:p-8"
                }
              >
                {plan.highlighted && (
                  <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-accent-strong px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-strong-foreground">
                    <Zap className="size-3" aria-hidden /> {copy.popular}
                  </span>
                )}
                <p className={plan.highlighted ? "text-sm font-bold text-primary-strong-foreground/80" : "text-sm font-bold text-primary"}>{plan.displayName}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-[-0.04em]">{plan.priceLabel}</span>
                  {plan.priceCents > 0 && <span className={plan.highlighted ? "pb-1 text-sm text-primary-strong-foreground/60" : "pb-1 text-sm text-muted-foreground"}>{copy.perMonth}</span>}
                </div>
                <p className={plan.highlighted ? "mt-4 min-h-12 text-sm leading-6 text-primary-strong-foreground/65" : "mt-4 min-h-12 text-sm leading-6 text-muted-foreground"}>{plan.description}</p>
                <div className={plan.highlighted ? "my-7 h-px bg-primary-strong-foreground/10" : "my-7 h-px bg-primary-strong/10"} />
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={plan.highlighted ? "flex items-start gap-2.5 text-sm text-primary-strong-foreground/80" : "flex items-start gap-2.5 text-sm text-muted-foreground"}>
                      <CheckCircle2 className={plan.highlighted ? "mt-0.5 size-4 shrink-0 text-accent-strong" : "mt-0.5 size-4 shrink-0 text-primary"} aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a href={SALES_HREF} className={cn(buttonVariants({ variant: plan.highlighted ? "accent" : "default", size: "lg" }), "mt-8 rounded-full font-bold transition-transform hover:-translate-y-0.5")}>{plan.cta}</a>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary-strong px-6 py-16 text-center text-primary-strong-foreground shadow-2xl shadow-primary/20 sm:px-12 sm:py-20">
          <div className="landing-grid-dark pointer-events-none absolute inset-0 opacity-30" />
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-accent-strong/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary-strong-foreground/10 bg-primary-strong-foreground/10 text-accent-strong">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <h2 className="mt-6 text-balance text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{copy.ctaTitle}</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-primary-strong-foreground/65">{copy.ctaBody}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={primaryHref} className={cn(buttonVariants({ variant: "accent", size: "lg" }), "group h-12 rounded-full px-7 font-bold transition-transform hover:-translate-y-0.5")}>
                {primaryLabel} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <Link href="/o/includo/chat" className="inline-flex h-12 items-center justify-center rounded-full border border-primary-strong-foreground/15 px-7 text-sm font-bold text-primary-strong-foreground transition-colors hover:bg-primary-strong-foreground/10">{copy.liveDemo}</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Image
            src={PLATFORM.logo}
            alt={PLATFORM.name}
            width={PLATFORM.logoWidth}
            height={PLATFORM.logoHeight}
            className="h-6 w-auto dark:brightness-200"
            unoptimized
          />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {PLATFORM.name}. {copy.rights}</p>
          <div className="flex items-center gap-5 text-xs font-semibold text-muted-foreground">
            <a href={SALES_HREF} className="transition-colors hover:text-primary">{copy.contact}</a>
            <Link href="/privacy" className="transition-colors hover:text-primary">{copy.privacy}</Link>
            <Link href="/auth/login" className="transition-colors hover:text-primary">{copy.signIn}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
