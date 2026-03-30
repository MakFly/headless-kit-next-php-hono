import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as getMessages } from './SEOHead_vuvfZxuQ.mjs';

function AuthNavButtons({ locale = "en", productionMode = false }) {
  const t = getMessages(locale);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!productionMode);
  useEffect(() => {
    if (productionMode) {
      return;
    }
    fetch("/api/auth/get-session", { credentials: "include" }).then((res) => res.ok ? res.json() : null).then((data) => {
      setUser(data?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productionMode]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "hidden h-8 w-20 animate-pulse rounded-full bg-muted sm:block" });
  }
  if (productionMode) {
    return null;
  }
  if (user) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/dashboard",
          className: "hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-block",
          children: t.nav.dashboard
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/auth/logout",
          className: "hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block",
          children: t.nav.logout
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/auth/login",
        className: "hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block",
        children: t.nav.signIn
      }
    ),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/auth/register",
        className: "hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-block",
        children: t.nav.getStarted
      }
    )
  ] });
}

export { AuthNavButtons as A };
