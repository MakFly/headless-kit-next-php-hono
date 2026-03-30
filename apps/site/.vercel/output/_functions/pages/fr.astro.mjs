import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C6wb1U6_.mjs';
import { g as getLocale } from '../chunks/SEOHead_vuvfZxuQ.mjs';
import { $ as $$Main } from '../chunks/main_C64414HP.mjs';
import { $ as $$Navbar, a as $$Hero, b as $$SocialProof, c as $$FeaturesGrid, d as $$ModulesShowcase, e as $$ArchitectureDiagram, f as $$QuickStart, g as $$Pricing, h as $$FAQ, i as $$CTABanner, j as $$Footer } from '../chunks/Footer_DSsRnjeZ.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  getLocale(Astro2.currentLocale);
  return renderTemplate`${renderComponent($$result, "Layout", $$Main, { "title": "Accueil", "description": "Kit de démarrage headless multi-backend avec BFF Next.js" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Navbar", $$Navbar, {})} ${maybeRenderHead()}<main> ${renderComponent($$result2, "Hero", $$Hero, {})} ${renderComponent($$result2, "SocialProof", $$SocialProof, {})} ${renderComponent($$result2, "FeaturesGrid", $$FeaturesGrid, {})} ${renderComponent($$result2, "ModulesShowcase", $$ModulesShowcase, {})} ${renderComponent($$result2, "ArchitectureDiagram", $$ArchitectureDiagram, {})} ${renderComponent($$result2, "QuickStart", $$QuickStart, {})} ${renderComponent($$result2, "Pricing", $$Pricing, {})} ${renderComponent($$result2, "FAQ", $$FAQ, {})} ${renderComponent($$result2, "CTABanner", $$CTABanner, {})} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/fr/index.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/fr/index.astro";
const $$url = "/fr";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
