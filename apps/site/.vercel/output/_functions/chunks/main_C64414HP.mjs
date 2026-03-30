import { b as createAstro, c as createComponent, a as renderTemplate, r as renderComponent, h as renderSlot, g as renderHead, e as addAttribute } from './astro/server_C6wb1U6_.mjs';
/* empty css                         */
import { g as getLocale, $ as $$SEOHead } from './SEOHead_vuvfZxuQ.mjs';
import { T as Toaster } from './sonner_Ds11cde8.mjs';
import { $ as $$JsonLd } from './JsonLd_BomKjIGt.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const $$Main = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Main;
  const { title, description } = Astro2.props;
  const locale = getLocale(Astro2.currentLocale);
  const pageTitle = title ? `${title} — Headless Kit` : "Headless Kit — Build Full-Stack Apps with Domain-Driven Modules";
  const pageDescription = description || "Production-grade headless starter kit with Next.js BFF, multi-backend auth, and domain-driven modules.";
  return renderTemplate(_a || (_a = __template(["<html", '> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="light dark">', '<link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>', "</title>", "<script>\n      const t = localStorage.getItem('theme');\n      if (t === 'dark') document.documentElement.classList.add('dark');\n    <\/script>", '</head> <body class="min-h-svh antialiased"> <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">\nSkip to content\n</a> <div id="main-content"> ', " </div> ", " </body></html>"])), addAttribute(locale, "lang"), renderComponent($$result, "SEOHead", $$SEOHead, { "title": pageTitle, "description": pageDescription }), pageTitle, renderComponent($$result, "JsonLd", $$JsonLd, { "data": {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Headless Kit",
    "url": "https://headlesskit.dev",
    "description": "Production-grade headless starter kit with multi-backend BFF architecture",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://headlesskit.dev/docs?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  } }), renderHead(), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Toaster", Toaster, { "client:load": true, "position": "bottom-right", "richColors": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/sonner", "client:component-export": "Toaster" }));
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/layouts/main.astro", void 0);

export { $$Main as $ };
