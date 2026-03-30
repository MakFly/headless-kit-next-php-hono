import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, e as addAttribute, m as maybeRenderHead } from '../../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../../chunks/dashboard_CZ5mJo0o.mjs';
export { renderers } from '../../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Create = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Create;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const prefillEmail = Astro2.url.searchParams.get("email") || "";
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Create License", "currentPath": "/dashboard/admin/licenses" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <!-- Back link --> <div> <a href="/dashboard/admin/licenses" class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">\n&larr; Back to Licenses\n</a> </div> <div> <h2 class="text-3xl font-bold tracking-tight">Create Manual License</h2> <p class="text-muted-foreground">Issue a license manually for a user.</p> </div> <!-- Form card --> <div class="max-w-lg overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-col gap-5 px-6"> <!-- Email --> <div class="flex flex-col gap-2"> <label for="email" class="text-sm font-medium">\nUser Email\n</label> <input type="email" id="email" name="email"', ` placeholder="user@example.com" required class="h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"> </div> <!-- Tier --> <div class="flex flex-col gap-2"> <label for="tier" class="text-sm font-medium">
Tier
</label> <select id="tier" name="tier" class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"> <option value="pro">Pro</option> <option value="business">Business</option> </select> </div> <!-- Expiry --> <div class="flex flex-col gap-2"> <label for="expiry" class="text-sm font-medium">
Expiry
</label> <select id="expiry" name="expiry" class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"> <option value="1year">1 Year</option> <option value="lifetime">Lifetime</option> </select> </div> <!-- Error message --> <div id="error-msg" class="hidden rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"></div> <!-- Create button --> <button type="button" id="create-btn" class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
Create License
</button> </div> </div> </div> <script>
    document.getElementById('create-btn').addEventListener('click', async () => {
      const email = document.getElementById('email').value.trim()
      const tier = document.getElementById('tier').value
      const expiry = document.getElementById('expiry').value
      const errorEl = document.getElementById('error-msg')
      const btn = document.getElementById('create-btn')

      errorEl.classList.add('hidden')

      if (!email) {
        errorEl.textContent = 'Email is required.'
        errorEl.classList.remove('hidden')
        return
      }

      btn.textContent = 'Creating...'
      btn.disabled = true

      try {
        const res = await fetch('/api/admin/licenses/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            tier,
            lifetime: expiry === 'lifetime',
          }),
        })

        const data = await res.json().catch(() => ({}))

        if (!res.ok || !data.success) {
          errorEl.textContent = data.error || data.message || 'Failed to create license.'
          errorEl.classList.remove('hidden')
          btn.textContent = 'Create License'
          btn.disabled = false
          return
        }

        window.location.href = '/dashboard/admin/licenses'
      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.'
        errorEl.classList.remove('hidden')
        btn.textContent = 'Create License'
        btn.disabled = false
      }
    })
  <\/script> `])), maybeRenderHead(), addAttribute(prefillEmail, "value")) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/licenses/create.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/licenses/create.astro";
const $$url = "/dashboard/admin/licenses/create";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Create,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
