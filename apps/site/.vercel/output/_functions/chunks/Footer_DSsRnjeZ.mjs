import { b as createAstro, c as createComponent, m as maybeRenderHead, a as renderTemplate, r as renderComponent, e as addAttribute, u as unescapeHTML, F as Fragment, d as renderScript } from './astro/server_C6wb1U6_.mjs';
import { s as switchLocalePath, g as getLocale, a as getMessages } from './SEOHead_vuvfZxuQ.mjs';
import { T as ThemeToggle, c as cn, B as Button } from './ThemeToggle_CNK33n6y.mjs';
import { A as AuthNavButtons } from './AuthNavButtons_BMjxtYX2.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { motion, useInView } from 'framer-motion';
import 'clsx';
import { useRef } from 'react';
import { cva } from 'class-variance-authority';
import { Slot } from 'radix-ui';

function LanguageSwitcher({ locale, currentPath }) {
  const otherPath = switchLocalePath(currentPath, locale);
  const label = locale === "en" ? "FR" : "EN";
  return /* @__PURE__ */ jsx(
    "a",
    {
      href: otherPath,
      className: "rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
      children: label
    }
  );
}

const $$Astro$a = createAstro("https://headlesskit.dev");
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$Navbar;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const currentPath = Astro2.url.pathname;
  const siteMode = "development";
  const isProductionMode = siteMode === "production";
  return renderTemplate`${maybeRenderHead()}<nav class="glass fixed top-0 z-50 w-full" aria-label="Main navigation"> <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"> <a href="/" class="text-lg font-semibold tracking-tight text-foreground">
Headless Kit
</a> <div class="hidden items-center gap-8 md:flex"> <a href="#features" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.features} </a> <a href="#architecture" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.architecture} </a> <a href="#modules" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.modules} </a> ${renderTemplate`<a href="#pricing" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.pricing} </a>`} <a href="/docs/getting-started/installation" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.docs} </a> <a href="https://github.com/headless-kit/headless-kit" target="_blank" rel="noopener noreferrer" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.github} </a> </div> <div class="flex items-center gap-3"> ${renderComponent($$result, "LanguageSwitcher", LanguageSwitcher, { "locale": locale, "currentPath": currentPath })} ${renderComponent($$result, "ThemeToggle", ThemeToggle, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/ThemeToggle", "client:component-export": "ThemeToggle" })} ${renderComponent($$result, "AuthNavButtons", AuthNavButtons, { "client:load": true, "locale": locale, "productionMode": isProductionMode, "client:component-hydration": "load", "client:component-path": "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/AuthNavButtons", "client:component-export": "AuthNavButtons" })} </div> </div> </nav>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/Navbar.astro", void 0);

const spring$1 = { type: "spring", damping: 25, stiffness: 120 };
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring$1 }
};
const stacks = ["Laravel", "Symfony", "Hono", "Next.js", "TanStack"];
function HeroContent({ locale = "en" }) {
  const t = getMessages(locale);
  const checks = [
    t.hero.freeOpenSource,
    t.hero.threeBackends,
    t.hero.authIncluded,
    t.hero.secureBff
  ];
  return /* @__PURE__ */ jsxs(
    motion.div,
    {
      variants: container,
      initial: "hidden",
      animate: "show",
      className: "relative z-20 mx-auto max-w-4xl px-6 text-center",
      children: [
        /* @__PURE__ */ jsx(motion.div, { variants: fadeUp, className: "mb-8", children: /* @__PURE__ */ jsx("span", { className: "inline-block rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground", children: t.hero.badge }) }),
        /* @__PURE__ */ jsxs(
          motion.h1,
          {
            variants: fadeUp,
            className: "text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl",
            children: [
              t.hero.titleLine1,
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "gradient-text", children: t.hero.titleAccent }),
              /* @__PURE__ */ jsx("br", {}),
              t.hero.titleLine3
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.p,
          {
            variants: fadeUp,
            className: "mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl",
            children: [
              t.hero.subtitle,
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: t.hero.subtitleBold }),
              " ",
              t.hero.subtitleEnd
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            variants: fadeUp,
            className: "mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row",
            children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/auth/register",
                  className: "inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
                  children: t.hero.ctaPrimary
                }
              ),
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "#quickstart",
                  className: "inline-flex items-center rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20",
                  children: [
                    /* @__PURE__ */ jsx("span", { className: "mr-2 font-mono text-muted-foreground/60", children: "$" }),
                    t.hero.ctaSecondary
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          motion.div,
          {
            variants: fadeUp,
            className: "mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2",
            children: checks.map((text) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { className: "text-apple-green", children: "✓" }),
              " ",
              text
            ] }, text))
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            variants: fadeUp,
            className: "mt-10 flex items-center justify-center gap-8",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground/60", children: t.hero.worksWith }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-5", children: stacks.map((name) => /* @__PURE__ */ jsx(
                "span",
                {
                  className: "cursor-default text-sm text-muted-foreground/50 transition-colors hover:text-foreground",
                  title: name,
                  children: name
                },
                name
              )) })
            ]
          }
        )
      ]
    }
  );
}

const $$Astro$9 = createAstro("https://headlesskit.dev");
const $$Hero = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$Hero;
  const locale = getLocale(Astro2.currentLocale);
  return renderTemplate`${maybeRenderHead()}<section class="relative flex min-h-svh items-center justify-center overflow-hidden pt-16"> ${renderComponent($$result, "HeroContent", HeroContent, { "client:load": true, "locale": locale, "client:component-hydration": "load", "client:component-path": "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/HeroContent", "client:component-export": "HeroContent" })} </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/Hero.astro", void 0);

const $$Astro$8 = createAstro("https://headlesskit.dev");
const $$SocialProof = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$SocialProof;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const stats = [
    { value: "3", label: t.socialProof.backendFrameworks, detail: t.socialProof.backendDetail },
    { value: "2", label: t.socialProof.frontendOptions, detail: t.socialProof.frontendDetail },
    { value: "4", label: t.socialProof.productionModules, detail: t.socialProof.modulesDetail },
    { value: "180+", label: t.socialProof.apiEndpoints, detail: t.socialProof.endpointsDetail }
  ];
  const techStack = [
    "TypeScript",
    "PHP 8.3",
    "Bun",
    "Tailwind v4",
    "Drizzle ORM",
    "Doctrine",
    "Eloquent",
    "Zod"
  ];
  return renderTemplate`${maybeRenderHead()}<section class="relative border-y border-border/50 py-16"> <div class="mx-auto max-w-6xl px-6"> <!-- Stats grid --> <div class="grid grid-cols-2 gap-6 md:grid-cols-4"> ${stats.map((stat) => renderTemplate`<div class="text-center"> <div class="text-3xl font-bold text-primary md:text-4xl"> ${stat.value} </div> <div class="mt-1 text-xs font-semibold uppercase tracking-widest text-foreground"> ${stat.label} </div> <div class="mt-1 text-xs text-muted-foreground"> ${stat.detail} </div> </div>`)} </div> <!-- Tech pills --> <div class="mt-12 flex flex-wrap items-center justify-center gap-3"> <span class="text-xs uppercase tracking-widest text-muted-foreground/60">${t.socialProof.builtWith}</span> ${techStack.map((tech) => renderTemplate`<span class="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"> ${tech} </span>`)} </div> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/SocialProof.astro", void 0);

const spring = { type: "spring", damping: 25, stiffness: 120 };
const icons = ["&#11041;", "&#9670;", "&#9673;", "&#9651;", "&#9678;", "&#9635;"];
const colors = ["text-apple-blue", "text-apple-indigo", "text-apple-purple", "text-apple-orange", "text-apple-teal", "text-apple-green"];
function FeaturesSection({ locale = "en" }) {
  const t = getMessages(locale);
  const features = t.features.items.map((item, i) => ({
    icon: icons[i],
    title: item.title,
    description: item.description,
    color: colors[i]
  }));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return /* @__PURE__ */ jsx("section", { id: "features", className: "section-padding", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-16 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium uppercase tracking-widest text-primary", children: t.features.eyebrow }),
      /* @__PURE__ */ jsxs("h2", { className: "mt-4 text-3xl font-bold tracking-tight md:text-5xl", children: [
        t.features.title,
        " ",
        /* @__PURE__ */ jsx("span", { className: "gradient-text", children: t.features.titleAccent })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-2xl text-lg text-muted-foreground", children: t.features.subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { ref, className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: features.map((feature, i) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 24 },
        animate: isInView ? { opacity: 1, y: 0 } : {},
        transition: { ...spring, delay: i * 0.08 },
        className: "glass-card-hover p-6",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `mb-3 text-2xl ${feature.color}`,
              dangerouslySetInnerHTML: { __html: feature.icon }
            }
          ),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold tracking-wide text-foreground", children: feature.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-muted-foreground", children: feature.description })
        ]
      },
      feature.title
    )) })
  ] }) });
}

const $$Astro$7 = createAstro("https://headlesskit.dev");
const $$FeaturesGrid = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$FeaturesGrid;
  const locale = getLocale(Astro2.currentLocale);
  return renderTemplate`${renderComponent($$result, "FeaturesSection", FeaturesSection, { "client:visible": true, "locale": locale, "client:component-hydration": "visible", "client:component-path": "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/FeaturesSection", "client:component-export": "FeaturesSection" })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/FeaturesGrid.astro", void 0);

const $$Astro$6 = createAstro("https://headlesskit.dev");
const $$ModulesShowcase = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$ModulesShowcase;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const modules = [
    {
      icon: "&#9673;",
      color: "text-apple-blue",
      accentBorder: "border-apple-blue/20",
      ...t.modules.auth
    },
    {
      icon: "&#9670;",
      color: "text-apple-purple",
      accentBorder: "border-apple-purple/20",
      ...t.modules.shop
    },
    {
      icon: "&#9651;",
      color: "text-apple-teal",
      accentBorder: "border-apple-teal/20",
      ...t.modules.saas
    },
    {
      icon: "&#9635;",
      color: "text-apple-orange",
      accentBorder: "border-apple-orange/20",
      ...t.modules.support
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="modules" class="section-padding"> <div class="mx-auto max-w-6xl px-6"> <!-- Section header --> <div class="mb-4 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.modules.eyebrow}</p> <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-5xl"> ${t.modules.title} <span class="gradient-text">${t.modules.titleAccent}</span> </h2> <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"> ${t.modules.subtitle} </p> </div> <!-- Modules grid --> <div class="mt-16 grid gap-6 md:grid-cols-2"> ${modules.map((mod) => renderTemplate`<div class="glass-card-hover p-6"> <div class="mb-3 flex items-center gap-3"> <span${addAttribute(["text-2xl", mod.color], "class:list")}>${unescapeHTML(mod.icon)}</span> <h3 class="text-base font-bold tracking-wide text-foreground"> ${mod.name} </h3> </div> <p${addAttribute(["mb-4 text-sm font-medium", mod.color], "class:list")}> ${mod.tagline} </p> <ul class="space-y-2"> ${mod.features.map((feature) => renderTemplate`<li class="flex items-start gap-2 text-sm text-muted-foreground"> <span${addAttribute(["mt-0.5 text-xs", mod.color], "class:list")}>&#10003;</span> ${feature} </li>`)} </ul> </div>`)} </div> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/ModulesShowcase.astro", void 0);

const $$Astro$5 = createAstro("https://headlesskit.dev");
const $$ArchitectureDiagram = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$ArchitectureDiagram;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  return renderTemplate`${maybeRenderHead()}<section id="architecture" class="section-padding"> <div class="mx-auto max-w-6xl px-6"> <!-- Section header --> <div class="mb-16 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.architecture.eyebrow}</p> <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-5xl"> ${t.architecture.titlePre} <span class="gradient-text">${t.architecture.titleAccent}</span>${t.architecture.titlePost} </h2> </div> <!-- Diagram --> <div class="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-4"> <!-- Client --> <div class="glass-card w-full max-w-xs p-6 text-center"> <div class="mb-3 text-3xl text-muted-foreground">&#9703;</div> <div class="text-sm font-bold tracking-wide text-foreground">${t.architecture.client}</div> <div class="mt-3 space-y-1.5"> <div class="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground"> ${t.architecture.nextjs} </div> <div class="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground"> ${t.architecture.tanstack} </div> </div> </div> <!-- Arrow --> <div class="flex flex-col items-center gap-1 text-muted-foreground md:flex-row"> <div class="hidden h-px w-12 bg-border md:block"></div> <div class="block h-8 w-px bg-border md:hidden"></div> <span class="text-xs font-medium">${t.architecture.https}</span> <div class="hidden h-px w-12 bg-border md:block"></div> <div class="block h-8 w-px bg-border md:hidden"></div> <span class="text-muted-foreground">&rarr;</span> </div> <!-- BFF --> <div class="glass-card w-full max-w-xs border-primary/30 p-6 text-center shadow-md"> <div class="mb-3 text-3xl text-primary">&#9670;</div> <div class="text-sm font-bold tracking-wide text-primary">${t.architecture.bffProxy}</div> <div class="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground"> ${t.architecture.routeHandlers} </div> <div class="mt-4 flex flex-wrap justify-center gap-2"> <span class="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] text-primary"> ${t.architecture.tokenAuth} </span> <span class="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] text-primary"> ${t.architecture.sessionMgmt} </span> <span class="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[10px] text-primary"> ${t.architecture.rateLimiting} </span> </div> </div> <!-- Arrow --> <div class="flex flex-col items-center gap-1 text-muted-foreground md:flex-row"> <div class="hidden h-px w-12 bg-border md:block"></div> <div class="block h-8 w-px bg-border md:hidden"></div> <span class="text-xs font-medium">${t.architecture.bearer}</span> <div class="hidden h-px w-12 bg-border md:block"></div> <div class="block h-8 w-px bg-border md:hidden"></div> <span class="text-muted-foreground">&rarr;</span> </div> <!-- Backend --> <div class="glass-card w-full max-w-xs p-6 text-center"> <div class="mb-3 text-3xl text-muted-foreground">&#9635;</div> <div class="text-sm font-bold tracking-wide text-foreground">${t.architecture.backendApi}</div> <div class="mt-3 space-y-1.5"> <div class="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs"> <span class="text-apple-red">&#9670;</span> <span class="text-muted-foreground">Laravel <span class="text-muted-foreground/50">:8002</span></span> </div> <div class="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs"> <span class="text-apple-purple">&#9670;</span> <span class="text-muted-foreground">Symfony <span class="text-muted-foreground/50">:8001</span></span> </div> <div class="flex items-center justify-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs"> <span class="text-apple-orange">&#9670;</span> <span class="text-muted-foreground">Hono <span class="text-muted-foreground/50">:3333</span></span> </div> </div> </div> </div> <!-- Bottom note --> <p class="mt-12 text-center text-sm text-muted-foreground"> ${t.architecture.bottomNote} </p> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/ArchitectureDiagram.astro", void 0);

const $$Astro$4 = createAstro("https://headlesskit.dev");
const $$QuickStart = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$QuickStart;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const lines = [
    { prefix: "$", text: "bunx create-headless-app my-app", color: "text-zinc-100" },
    { prefix: "?", text: "Select a preset:", color: "text-blue-400" },
    { prefix: " ", text: "  E-commerce   SaaS   Admin   Landing", color: "text-zinc-500" },
    { prefix: "?", text: "Choose your frontend:", color: "text-blue-400" },
    { prefix: " ", text: "▸ Next.js (BFF)    TanStack Start", color: "text-green-400" },
    { prefix: "?", text: "Choose your backend:", color: "text-blue-400" },
    { prefix: " ", text: "  Laravel   ▸ Symfony   Hono", color: "text-green-400" },
    { prefix: "", text: "", color: "" },
    { prefix: "✓", text: "Scaffolding project...", color: "text-green-400" },
    { prefix: " ", text: "  Created my-app/frontend (Next.js + BFF)", color: "text-zinc-500" },
    { prefix: " ", text: "  Created my-app/backend (Symfony)", color: "text-zinc-500" },
    { prefix: " ", text: "  Installed 4 modules: Auth, Shop, SaaS, Support", color: "text-amber-400" },
    { prefix: "", text: "", color: "" },
    { prefix: "✓", text: "Done. cd my-app && bun dev", color: "text-green-300" }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="quickstart" class="section-padding"> <div class="mx-auto max-w-3xl px-6"> <!-- Section header --> <div class="mb-16 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.quickStart.eyebrow}</p> <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-5xl"> ${t.quickStart.title} <span class="gradient-text">${t.quickStart.titleAccent}</span> </h2> </div> <!-- Terminal window --> <div class="overflow-hidden rounded-2xl border border-border shadow-md"> <!-- Title bar --> <div class="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3"> <span class="size-3 rounded-full bg-red-500/80"></span> <span class="size-3 rounded-full bg-yellow-500/80"></span> <span class="size-3 rounded-full bg-green-500/80"></span> <span class="ml-2 font-mono text-xs text-zinc-500">~/projects</span> </div> <!-- Terminal body — always dark --> <div class="bg-zinc-950 p-6 font-mono text-sm leading-relaxed"> ${lines.map((line) => renderTemplate`<div> ${line.prefix || line.text ? renderTemplate`<span> ${line.prefix === "$" && renderTemplate`<span class="mr-2 text-green-400">$</span>`} ${line.prefix === "?" && renderTemplate`<span class="mr-2 text-blue-400">?</span>`} ${line.prefix === "✓" && renderTemplate`<span class="mr-2 text-green-400">✓</span>`} ${line.prefix === " " && renderTemplate`<span class="mr-2">&nbsp;</span>`} <span${addAttribute(line.color, "class")}> ${line.text} </span> </span>` : renderTemplate`<br>`} </div>`)} </div> </div> <!-- Bottom text --> <p class="mt-8 text-center text-sm text-muted-foreground"> ${t.quickStart.requires} <span class="font-medium text-foreground">${t.quickStart.bun}</span> ${t.quickStart.systemNote} </p> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/QuickStart.astro", void 0);

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      "data-variant": variant,
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}

const $$Astro$3 = createAstro("https://headlesskit.dev");
const $$Pricing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Pricing;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const tiers = [
    {
      name: t.pricing.starter.name,
      price: t.pricing.starter.price,
      period: t.pricing.starter.period,
      description: t.pricing.starter.description,
      cta: t.pricing.starter.cta,
      ctaVariant: "outline",
      ctaClass: "",
      popular: false,
      features: t.pricing.starter.features,
      limits: t.pricing.starter.limits,
      tierKey: "starter"
    },
    {
      name: t.pricing.pro.name,
      price: t.pricing.pro.price,
      period: t.pricing.pro.period,
      description: t.pricing.pro.description,
      cta: t.pricing.pro.cta,
      ctaVariant: "default",
      ctaClass: "bg-primary text-primary-foreground hover:bg-primary/90",
      popular: true,
      features: t.pricing.pro.features,
      limits: [],
      tierKey: "pro"
    },
    {
      name: t.pricing.business.name,
      price: t.pricing.business.price,
      period: t.pricing.business.period,
      description: t.pricing.business.description,
      cta: t.pricing.business.cta,
      ctaVariant: "outline",
      ctaClass: "",
      popular: false,
      features: [t.pricing.business.includesProPlus, ...t.pricing.business.features],
      limits: [],
      tierKey: "business"
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="pricing" class="section-padding"> <div class="mx-auto max-w-6xl px-6"> <!-- Section header --> <div class="mb-16 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.pricing.eyebrow}</p> <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-5xl"> ${t.pricing.title} <span class="gradient-text">${t.pricing.titleAccent}</span> </h2> <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"> ${t.pricing.subtitle} </p> </div> <!-- Pricing grid --> <div class="grid gap-6 md:grid-cols-3"> ${tiers.map((tier) => renderTemplate`<div${addAttribute([
    "relative glass-card p-6 flex flex-col",
    tier.popular && "border-primary/50 shadow-md"
  ], "class:list")}> ${tier.popular && renderTemplate`<div class="absolute -top-3 left-1/2 z-10 -translate-x-1/2"> ${renderComponent($$result, "Badge", Badge, { "className": "rounded-full bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-widest" }, { "default": async ($$result2) => renderTemplate`${t.pricing.mostPopular}` })} </div>`} <div> <h3 class="text-sm font-bold tracking-wide text-foreground"> ${tier.name} </h3> <div class="mt-4 flex items-baseline gap-1"> ${renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <span class="text-4xl font-bold text-foreground">${tier.price}</span> <span class="text-xs text-muted-foreground">/ ${tier.period}</span> ` })}` } </div> <p class="mt-2 text-sm text-muted-foreground"> ${tier.description} </p> </div> <ul class="mt-6 flex-1 space-y-3"> ${tier.features.map((feature, fi) => renderTemplate`<li class="flex items-start gap-2 text-sm text-muted-foreground"> <span${addAttribute(["mt-0.5 text-xs", fi === 0 && tier.tierKey === "business" ? "text-transparent" : "text-apple-green"], "class:list")}> ${fi === 0 && tier.tierKey === "business" ? "—" : "✓"} </span> <span${addAttribute(fi === 0 && tier.tierKey === "business" ? "font-semibold text-foreground" : "", "class")}> ${feature} </span> </li>`)} ${tier.limits && tier.limits.length > 0 && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate` <li class="border-t border-border pt-3"></li> ${tier.limits.map((limit) => renderTemplate`<li class="flex items-start gap-2 text-sm text-muted-foreground/60"> <span class="mt-0.5 text-xs text-destructive">✕</span> ${limit} </li>`)}` })}`} </ul> <div class="mt-8"> ${tier.tierKey === "starter" ? renderTemplate`<a href="/auth/register" class="block"> ${renderComponent($$result, "Button", Button, { "client:load": true, "size": "lg", "variant": tier.ctaVariant, "className": "w-full rounded-full text-sm", "client:component-hydration": "load", "client:component-path": "@/components/ui/button", "client:component-export": "Button" }, { "default": async ($$result2) => renderTemplate`${tier.cta}` })} </a>` : renderTemplate`${renderComponent($$result, "Button", Button, { "client:load": true, "size": "lg", "variant": tier.ctaVariant, "className": `w-full rounded-full text-sm checkout-btn ${tier.ctaClass}`, "data-tier": tier.tierKey, "client:component-hydration": "load", "client:component-path": "@/components/ui/button", "client:component-export": "Button" }, { "default": async ($$result2) => renderTemplate`${tier.cta}` })}` } </div> </div>`)} </div> <!-- Trust note --> ${renderTemplate`<p class="mt-10 text-center text-sm text-muted-foreground"> <span class="text-apple-green">✓</span> ${t.pricing.trustGuarantee} &nbsp;&middot;&nbsp;
<span class="text-apple-green">✓</span> ${t.pricing.trustStripe} &nbsp;&middot;&nbsp;
<span class="text-apple-green">✓</span> ${t.pricing.trustAccess} </p>`} </div> </section> ${renderScript($$result, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/Pricing.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/Pricing.astro", void 0);

const $$Astro$2 = createAstro("https://headlesskit.dev");
const $$FAQ = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$FAQ;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const faqs = t.faq.items;
  return renderTemplate`${maybeRenderHead()}<section id="faq" class="section-padding"> <div class="mx-auto max-w-3xl px-6"> <!-- Section header --> <div class="mb-16 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.faq.eyebrow}</p> <h2 class="mt-4 text-3xl font-bold tracking-tight md:text-5xl"> ${t.faq.title} <span class="gradient-text">${t.faq.titleAccent}</span> </h2> </div> <!-- FAQ list --> <div class="space-y-4"> ${faqs.map((faq) => renderTemplate`<details class="group glass-card transition-colors hover:bg-muted/50"> <summary class="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-foreground select-none list-none"> ${faq.q} <span class="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span> </summary> <div class="px-6 pb-4 text-sm leading-relaxed text-muted-foreground"> ${faq.a} </div> </details>`)} </div> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/FAQ.astro", void 0);

const $$Astro$1 = createAstro("https://headlesskit.dev");
const $$CTABanner = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CTABanner;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  return renderTemplate`${maybeRenderHead()}<section class="section-padding gradient-bg"> <div class="mx-auto max-w-3xl px-6 text-center"> <p class="text-sm font-medium uppercase tracking-widest text-primary">${t.cta.eyebrow}</p> <h2 class="mt-6 text-3xl font-bold tracking-tight md:text-5xl"> ${t.cta.title} <br> <span class="gradient-text">${t.cta.titleAccent}</span> </h2> <p class="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"> ${t.cta.subtitle} </p> <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"> <a href="/auth/register" class="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"> ${t.cta.ctaPrimary} </a> <a href="#pricing" class="inline-flex items-center rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"> ${t.cta.ctaSecondary} </a> </div> <p class="mt-6 text-sm text-muted-foreground"> ${t.cta.freeNote} </p> </div> </section>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/CTABanner.astro", void 0);

const $$Astro = createAstro("https://headlesskit.dev");
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Footer;
  const locale = getLocale(Astro2.currentLocale);
  const t = getMessages(locale);
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return renderTemplate`${maybeRenderHead()}<footer class="border-t border-border"> <div class="mx-auto max-w-6xl px-6 py-12"> <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"> <!-- Brand --> <div> <div class="text-sm font-semibold tracking-tight text-foreground"> ${t.footer.brand} </div> <p class="mt-3 text-sm text-muted-foreground"> ${t.footer.tagline} </p> </div> <!-- Product --> <div> <div class="text-xs font-medium uppercase tracking-widest text-muted-foreground">${t.footer.product}</div> <ul class="mt-3 space-y-2"> <li> <a href="#features" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.features} </a> </li> <li> <a href="#modules" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.modules.eyebrow} </a> </li> <li> <a href="#pricing" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.nav.pricing} </a> </li> <li> <a href="#faq" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.faq.eyebrow} </a> </li> </ul> </div> <!-- Resources --> <div> <div class="text-xs font-medium uppercase tracking-widest text-muted-foreground">${t.footer.resources}</div> <ul class="mt-3 space-y-2"> <li> <a href="/docs/getting-started/installation" class="text-sm text-muted-foreground transition-colors hover:text-foreground"> ${t.footer.documentation} </a> </li> <li> <a href="https://github.com/headless-kit/headless-kit" target="_blank" rel="noopener noreferrer" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
GitHub
</a> </li> <li> <a href="#" class="text-sm text-muted-foreground transition-colors hover:text-foreground">
Discord
</a> </li> </ul> </div> <!-- Contact --> <div> <div class="text-xs font-medium uppercase tracking-widest text-muted-foreground">${t.footer.contact}</div> <ul class="mt-3 space-y-2"> <li> <a href="mailto:hello@headlesskit.dev" class="text-sm text-primary transition-colors hover:text-primary/80">
hello@headlesskit.dev
</a> </li> <li class="text-xs text-muted-foreground"> ${t.footer.supportNote} </li> </ul> <div class="mt-4 flex flex-wrap gap-2"> ${["Astro", "React", "Tailwind", "shadcn/ui", "Bun"].map((tech) => renderTemplate`<span class="rounded-full border border-border px-2.5 py-0.5 text-[10px] text-muted-foreground"> ${tech} </span>`)} </div> </div> </div> <!-- Bottom bar --> <div class="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 sm:flex-row sm:justify-between"> <span class="text-xs text-muted-foreground">
&copy; ${year} ${t.footer.copyright} </span> <span class="text-xs text-muted-foreground"> ${t.footer.builtBy} </span> </div> </div> </footer>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/landing/Footer.astro", void 0);

export { $$Navbar as $, $$Hero as a, $$SocialProof as b, $$FeaturesGrid as c, $$ModulesShowcase as d, $$ArchitectureDiagram as e, $$QuickStart as f, $$Pricing as g, $$FAQ as h, $$CTABanner as i, $$Footer as j };
