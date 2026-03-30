import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as renderScript } from '../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Main } from '../../chunks/main_C64414HP.mjs';
import { s as stripe } from '../../chunks/stripe_DbHctTlv.mjs';
import { g as getLicenseByUser } from '../../chunks/license_CP9fThp_.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Success = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Success;
  const sessionId = Astro2.url.searchParams.get("session_id");
  const user = Astro2.locals.user;
  if (!user) {
    return Astro2.redirect("/auth/login?redirect=/checkout/success");
  }
  let paymentStatus = "unknown";
  let planName = "";
  let licenseKey = null;
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentStatus = session.payment_status;
      planName = session.metadata?.tier === "business" ? "Business" : "Pro";
    } catch {
      paymentStatus = "error";
    }
    const license = await getLicenseByUser(user.id);
    if (license) {
      licenseKey = license.licenseKey;
    }
  }
  const isSuccess = paymentStatus === "paid";
  return renderTemplate`${renderComponent($$result, "Layout", $$Main, {}, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="relative flex min-h-svh items-center justify-center overflow-hidden px-6"> <div class="relative z-10 mx-auto w-full max-w-lg text-center"> ${isSuccess ? renderTemplate`<div> <!-- Success icon --> <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-apple-green/30 bg-apple-green/10"> <svg class="h-10 w-10 text-apple-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path> </svg> </div> <h1 class="text-3xl font-bold tracking-tight md:text-4xl"> <span class="gradient-text">Payment successful</span> </h1> <p class="mt-4 text-lg text-muted-foreground">
Welcome to Headless Kit <span class="font-semibold text-foreground">${planName}</span>.
            Your license is ready.
</p> ${licenseKey ? renderTemplate`<div class="glass-card mt-8 p-6"> <p class="mb-2 text-xs font-medium uppercase tracking-widest text-primary">
Your license key
</p> <div class="group relative"> <code id="license-key" class="block break-all rounded-lg bg-muted px-4 py-3 font-mono text-sm text-foreground"> ${licenseKey} </code> <button id="copy-btn" class="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100" title="Copy to clipboard">
copy
</button> </div> <p class="mt-3 text-xs text-muted-foreground">
Save this key securely. You can also find it in your dashboard.
</p> </div>` : renderTemplate`<div class="glass-card mt-8 p-6"> <p class="text-sm text-muted-foreground">
Your license is being generated. Check your
<a href="/dashboard" class="text-primary underline underline-offset-4 hover:text-primary/80">
dashboard
</a> ${" "}in a moment.
</p> </div>`} <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"> <a href="/dashboard" class="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
Go to Dashboard
</a> <a href="/" class="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm text-muted-foreground transition-colors hover:text-foreground">
Back to Home
</a> </div> </div>` : renderTemplate`<div> <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10"> <svg class="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path> </svg> </div> <h1 class="text-3xl font-bold tracking-tight md:text-4xl">
Payment issue
</h1> <p class="mt-4 text-lg text-muted-foreground"> ${paymentStatus === "error" ? "We couldn't verify your payment session. Please contact support." : "Your payment hasn't been confirmed yet. If you were charged, please contact support."} </p> <div class="mt-8"> <a href="/#pricing" class="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm text-muted-foreground transition-colors hover:text-foreground">
Try Again
</a> </div> </div>`} </div> </main> ${renderScript($$result2, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/checkout/success.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/checkout/success.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/checkout/success.astro";
const $$url = "/checkout/success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Success,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
