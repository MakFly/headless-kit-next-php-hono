import { b as createAstro, c as createComponent, e as addAttribute, a as renderTemplate, r as renderComponent } from './astro/server_C6wb1U6_.mjs';
import 'clsx';

const en = {
  // ── Navigation ──
  nav: {
    features: "Features",
    architecture: "Architecture",
    modules: "Modules",
    pricing: "Pricing",
    docs: "Docs",
    github: "GitHub",
    signIn: "Sign In",
    getStarted: "Get Started",
    dashboard: "Dashboard",
    logout: "Logout",
    backToHome: "Back to home"
  },
  // ── Hero ──
  hero: {
    badge: "Open Source — MIT License",
    titleLine1: "Stop Rebuilding",
    titleAccent: "Auth, Payments & RBAC",
    titleLine3: "From Scratch",
    subtitle: "The full-stack starter kit that gives you",
    subtitleBold: "production-ready modules",
    subtitleEnd: "on day one. Pick your PHP or JS backend, scaffold in 30 seconds, and ship the features your users actually care about.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "bunx create-headless-app",
    freeOpenSource: "Free & open source",
    threeBackends: "3 backends, 2 frontends",
    authIncluded: "Auth + 2FA + OAuth included",
    secureBff: "Secure BFF proxy layer",
    worksWith: "Works with"
  },
  // ── Social Proof ──
  socialProof: {
    backendFrameworks: "Backend Frameworks",
    backendDetail: "Laravel · Symfony · Hono",
    frontendOptions: "Frontend Options",
    frontendDetail: "Next.js · TanStack Start",
    productionModules: "Production Modules",
    modulesDetail: "Auth · Shop · SaaS · Support",
    apiEndpoints: "API Endpoints",
    endpointsDetail: "Tested & documented",
    builtWith: "Built with"
  },
  // ── Features ──
  features: {
    eyebrow: "Why Headless Kit",
    title: "Weeks of boilerplate.",
    titleAccent: "Gone.",
    subtitle: "Every feature you'd build anyway — but tested, documented, and ready to customize.",
    items: [
      { title: "Swap Backends in Minutes", description: "Laravel, Symfony, or Hono — same API contract, same modules, same frontend. Switch without rewriting a single line of UI code." },
      { title: "Your API Stays Private", description: "The BFF streaming proxy passes responses with zero-copy, rate-limits auth endpoints, and deduplicates token refresh automatically. Your backend is never exposed to the browser." },
      { title: "Auth That Actually Works", description: "Login, register, 2FA, OAuth, password reset, refresh tokens — wired up across all 3 backends and both frontends. Tested with 180+ endpoints." },
      { title: "RBAC Without the Headache", description: "Three default roles, granular permissions, admin dashboard — all integrated. No more writing permission middleware for the 10th time." },
      { title: "End-to-End Type Safety", description: "Shared TypeScript types between frontend and BFF. Zod validation on the API. If it compiles, it works." },
      { title: "Ship Day One, Not Month Three", description: "Docker configs, CI pipelines, rate limiting, security headers, structured logging — production infrastructure out of the box." }
    ]
  },
  // ── Modules ──
  modules: {
    eyebrow: "Modules",
    title: "Four modules.",
    titleAccent: "Zero boilerplate.",
    subtitle: "Each module ships with backend API, frontend UI, server actions, and admin dashboard. Pick the ones you need. Skip the ones you don't.",
    auth: {
      name: "Auth & RBAC",
      tagline: "Login to production in minutes, not weeks",
      features: [
        "Email/password + OAuth (Google, GitHub)",
        "Two-factor authentication (TOTP)",
        "Password reset with secure tokens",
        "Role-based access control (admin, manager, user)",
        "Granular permissions (resource:action)",
        "Refresh token rotation with proactive renewal"
      ]
    },
    shop: {
      name: "E-commerce",
      tagline: "From product catalog to checkout — done",
      features: [
        "Product catalog with categories & search",
        "Persistent shopping cart (server-side)",
        "Order management with status tracking",
        "Inventory control with stock alerts",
        "Customer management & segmentation",
        "Admin dashboard with sales analytics"
      ]
    },
    saas: {
      name: "SaaS Multi-Tenant",
      tagline: "Organizations, billing, and teams — built-in",
      features: [
        "Multi-org with role-based membership",
        "Plan & subscription management",
        "Usage tracking with soft/hard limits",
        "Team invitations with email flow",
        "Org-scoped data isolation",
        "Billing dashboard with invoice history"
      ]
    },
    support: {
      name: "Support Center",
      tagline: "Customer support that doesn't suck",
      features: [
        "Conversation-based ticket system",
        "Agent queue with assignment & claiming",
        "Canned responses for fast replies",
        "Customer satisfaction ratings",
        "Priority levels & status tracking",
        "Support analytics & response times"
      ]
    }
  },
  // ── Architecture ──
  architecture: {
    eyebrow: "Architecture",
    titlePre: "The",
    titleAccent: "BFF Pattern",
    titlePost: ", Visualized",
    client: "Client",
    nextjs: "Next.js App Router",
    tanstack: "TanStack Start",
    https: "HTTPS",
    bffProxy: "BFF Proxy",
    routeHandlers: "/api/v1/* Route Handlers",
    tokenAuth: "Token Auth",
    sessionMgmt: "Session Mgmt",
    rateLimiting: "Rate Limiting",
    bearer: "Bearer",
    backendApi: "Backend API",
    bottomNote: "The browser never contacts backends directly. All requests are streamed through the BFF with zero-copy pass-through, auth-endpoint rate limiting, and automatic refresh deduplication."
  },
  // ── QuickStart ──
  quickStart: {
    eyebrow: "Quick Start",
    title: "Up and running in",
    titleAccent: "30 seconds",
    requires: "Requires",
    bun: "bun",
    systemNote: "v1.0+. Works on macOS, Linux, and WSL."
  },
  // ── Pricing ──
  pricing: {
    eyebrow: "Pricing",
    title: "One price.",
    titleAccent: "No subscriptions.",
    subtitle: "Pay once, ship forever. Start free with the basics, or unlock the full stack for the price of a few hours of freelancing.",
    mostPopular: "Most Popular",
    trustGuarantee: "30-day money-back guarantee",
    trustStripe: "Secure payment via Stripe",
    trustAccess: "Instant access after purchase",
    checkoutError: "Something went wrong. Please try again.",
    starter: {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Get started with the basics. Perfect for learning and prototyping.",
      cta: "Get Started Free",
      features: [
        "1 backend (Hono only)",
        "1 frontend (Next.js)",
        "Auth module (login, register, logout)",
        "Basic RBAC (2 roles: admin, user)",
        "Community Discord support",
        "Documentation access"
      ],
      limits: [
        "No 2FA / OAuth / password reset",
        "No Shop, SaaS, or Support modules",
        "No premium templates",
        "No email support"
      ]
    },
    pro: {
      name: "Pro",
      price: "$79",
      period: "one-time payment",
      description: "The full toolkit for shipping real products. Most developers start here.",
      cta: "Buy Pro — $79",
      features: [
        "All 3 backends (Laravel, Symfony, Hono)",
        "All 2 frontends (Next.js, TanStack Start)",
        "All 4 modules (Auth, Shop, SaaS, Support)",
        "Full auth: 2FA, OAuth, password reset, refresh tokens",
        "Full RBAC with granular permissions",
        "BFF proxy with token forwarding",
        "CLI scaffolding + all presets",
        "Priority email support (48h)",
        "1 year of updates included"
      ]
    },
    business: {
      name: "Business",
      price: "$199",
      period: "one-time payment",
      description: "Everything in Pro, plus premium integrations and dedicated support.",
      cta: "Buy Business — $199",
      includesProPlus: "Everything in Pro, plus:",
      features: [
        "Stripe integration (payments, subscriptions, webhooks)",
        "AI Assistant (assistant-ui + Vercel AI SDK)",
        "Premium admin dashboard templates",
        "Email templates (Resend / Mailgun)",
        "Advanced analytics & reporting",
        "Docker production configs + CI/CD pipelines",
        "Architecture consulting (1h included)",
        "Dedicated Discord channel",
        "Priority support (24h SLA)",
        "Lifetime updates"
      ]
    }
  },
  // ── FAQ ──
  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked",
    titleAccent: "questions",
    items: [
      { q: "What's the difference between Starter, Pro, and Business?", a: "Starter is free but limited — 1 backend (Hono), basic auth only, no 2FA/OAuth, no Shop/SaaS/Support modules. Pro ($79) unlocks ALL backends, ALL frontends, ALL modules with full auth (2FA, OAuth, password reset, RBAC). Business ($199) adds premium integrations: Stripe payments, AI Assistant, email templates, analytics, Docker production configs, and dedicated support." },
      { q: "Is this a subscription?", a: "No. Both Pro ($79) and Business ($199) are one-time payments. Pro includes 1 year of updates, Business includes lifetime updates. After the update period, your code still works — you just stop receiving new features unless you renew." },
      { q: "Can I use the free Starter version commercially?", a: "Yes. Starter is MIT licensed — use it for client projects, prototypes, or learning. But it's intentionally limited. For real production projects, Pro at $79 pays for itself in the first hour of development time you save." },
      { q: "Which backend should I choose?", a: "If you're a PHP developer: Laravel for rapid development with Eloquent, Symfony for enterprise-grade architecture with Doctrine. If you want full JavaScript: Hono on Bun is the fastest option. All three implement the same API contract, so you can switch later." },
      { q: "Do I need both Next.js and TanStack Start?", a: "No, pick one. Next.js is the recommended choice — it includes the BFF proxy layer with CSRF protection, token forwarding, and automatic token refresh. TanStack Start is a lighter alternative for simpler deployments." },
      { q: "How does the BFF pattern work?", a: "The browser never talks to your backend directly. All API requests go through a Next.js proxy layer that adds authentication headers, validates CSRF tokens, handles token refresh, and rate-limits requests. Your backend API stays completely private." },
      { q: "Can I add my own modules?", a: "Yes. Each module follows a Vertical Slice Architecture — just create a new feature directory in your backend and frontend. The documentation includes a step-by-step guide for creating custom modules." },
      { q: "What if I need help or get stuck?", a: "Starter users get community support on Discord. Pro users get priority email support with 48h response time. Business gets a dedicated Discord channel with 24h SLA." },
      { q: "Do you offer refunds?", a: "Yes — 30-day money-back guarantee on both Pro and Business, no questions asked. Email hello@headlesskit.dev for a full refund." }
    ]
  },
  // ── CTA Banner ──
  cta: {
    eyebrow: "Ready?",
    title: "Stop rebuilding the same stack.",
    titleAccent: "Start shipping features.",
    subtitle: "Auth, payments, RBAC, multi-tenancy — it's all here. Pick your backend, scaffold in 30 seconds, and focus on what makes your product unique.",
    ctaPrimary: "Get Started Free",
    ctaSecondary: "View Pro Features",
    freeNote: "Free forever. No credit card required."
  },
  // ── Footer ──
  footer: {
    brand: "Headless Kit",
    tagline: "The full-stack starter kit for developers who'd rather ship features than rebuild auth.",
    product: "Product",
    resources: "Resources",
    documentation: "Documentation",
    contact: "Contact",
    supportNote: "Priority support for Pro & Business",
    copyright: "Headless Kit. Open source under MIT license.",
    builtBy: "Built by developers, for developers."
  },
  // ── Auth ──
  auth: {
    signIn: "Sign In",
    signInSubtitle: "Welcome back. Enter your credentials to continue.",
    createAccount: "Create Account",
    createAccountSubtitle: "Join Headless Kit. Start building full-stack apps today.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "••••••••",
    confirmPassword: "Confirm Password",
    repeatPassword: "Repeat password",
    minChars: "Min. 8 characters",
    name: "Name",
    namePlaceholder: "Your name",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    or: "OR",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    hasAccount: "Already have an account?",
    signInLink: "Sign in",
    continueWithGoogle: "Continue with Google",
    signUpWithGoogle: "Sign up with Google",
    redirecting: "Redirecting...",
    invalidCredentials: "Invalid credentials. Please try again.",
    registrationFailed: "Registration failed. Please try again.",
    unexpectedError: "An unexpected error occurred. Please try again.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordsMismatch: "Passwords do not match.",
    devAutofill: "Dev Autofill",
    devAdmin: "Admin",
    devCustomerPro: "Customer (Pro)",
    devCustomerBusiness: "Customer (Business)",
    devFillRandom: "Fill Random User"
  },
  // ── Dashboard ──
  dashboard: {
    title: "Dashboard",
    welcomeBack: "Welcome back,",
    account: "Account",
    overview: "Overview",
    license: "License",
    downloads: "Downloads",
    billing: "Billing",
    documentation: "Documentation",
    backToSite: "Back to site",
    signOut: "Sign Out",
    administration: "Administration",
    users: "Users",
    licenses: "Licenses",
    revenue: "Revenue",
    settings: "Settings",
    noLicense: "No active license",
    upgrade: "Upgrade Now",
    upgradeSubtitle: "Upgrade to unlock premium features.",
    licenseTier: "License Tier",
    status: "Status",
    active: "Active",
    expired: "Expired",
    revoked: "Revoked",
    created: "Created",
    expires: "Expires",
    lifetime: "Lifetime",
    neverExpires: "Never expires",
    copyKey: "Copy",
    copied: "Copied!",
    manageLicense: "Manage your license key.",
    cliInstall: "CLI Install Command",
    premiumTemplates: "Premium Templates",
    dockerConfigs: "Docker Configs",
    cicdPipelines: "CI/CD Pipelines",
    requiresPro: "Requires Pro or Business license",
    requiresBusiness: "Requires Business license",
    currentPlan: "Current Plan",
    price: "Price",
    stripePortal: "Manage on Stripe",
    purchaseHistory: "Purchase History"
  },
  // ── Admin ──
  admin: {
    overview: "Admin Overview",
    overviewSubtitle: "Platform statistics at a glance.",
    totalUsers: "Total Users",
    totalLicenses: "Total Licenses",
    totalRevenue: "Total Revenue",
    activeLicenses: "Active Licenses",
    recentSignups: "Recent Signups",
    expiringLicenses: "Expiring Licenses",
    recentLicenses: "Recent Licenses",
    noExpiringLicenses: "No licenses expiring soon.",
    usersTitle: "Users",
    usersSubtitle: "Manage platform users.",
    searchPlaceholder: "Search by name or email...",
    search: "Search",
    all: "All",
    admins: "Admins",
    customers: "Customers",
    role: "Role",
    verified: "Verified",
    actions: "Actions",
    view: "View",
    promote: "Promote",
    demote: "Demote",
    deleteUser: "Delete User",
    deleteConfirm: "Are you sure you want to delete this user? This cannot be undone.",
    makeAdmin: "Make Admin",
    makeCustomer: "Make Customer",
    userDetail: "User Detail",
    userManagement: "User Management",
    changeRole: "Change Role",
    sessions: "Sessions",
    killSession: "Kill",
    ipAddress: "IP Address",
    userAgent: "User Agent",
    licensesTitle: "Licenses",
    licensesSubtitle: "Manage license keys.",
    createLicense: "Create License",
    createLicenseTitle: "Create Manual License",
    createLicenseSubtitle: "Issue a license key to a user.",
    userEmail: "User Email",
    tier: "Tier",
    licenseKey: "License Key",
    expiry: "Expiry",
    oneYear: "1 Year",
    revoke: "Revoke",
    reactivate: "Reactivate",
    extend: "Extend +1yr",
    create: "Create",
    revenueTitle: "Revenue",
    revenueSubtitle: "Financial overview.",
    proRevenue: "Pro Revenue",
    businessRevenue: "Business Revenue",
    openStripe: "Open Stripe Dashboard",
    allPurchases: "All Purchases",
    settingsTitle: "Settings",
    settingsSubtitle: "Platform configuration.",
    pricingPlans: "Pricing Plans",
    authentication: "Authentication",
    environment: "Environment",
    dangerZone: "Danger Zone",
    killAllSessions: "Kill All Sessions",
    killAllConfirm: "This will log out all users including yourself. Are you sure?",
    siteUrl: "Site URL",
    mode: "Mode",
    production: "Production",
    development: "Development",
    database: "Database",
    emailPassword: "Email + Password",
    enabled: "Enabled",
    googleOAuth: "Google OAuth",
    configured: "Configured",
    notConfigured: "Not configured",
    minPassword: "Min password length",
    characters: "characters",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    showing: "Showing",
    results: "results"
  },
  // ── Docs chrome ──
  docs: {
    onThisPage: "On this page",
    previous: "Previous",
    next: "Next",
    toggleSidebar: "Toggle sidebar"
  },
  // ── Language switcher ──
  lang: {
    switchTo: "FR",
    current: "EN"
  }
};

const fr = {
  // ── Navigation ──
  nav: {
    features: "Fonctionnalités",
    architecture: "Architecture",
    modules: "Modules",
    pricing: "Tarifs",
    docs: "Docs",
    github: "GitHub",
    signIn: "Connexion",
    getStarted: "Démarrer",
    dashboard: "Tableau de bord",
    logout: "Déconnexion",
    backToHome: "Retour à l'accueil"
  },
  // ── Hero ──
  hero: {
    badge: "Open Source — Licence MIT",
    titleLine1: "Arrêtez de reconstruire",
    titleAccent: "Auth, Paiements & RBAC",
    titleLine3: "à chaque projet",
    subtitle: "Le starter kit full-stack qui vous donne des",
    subtitleBold: "modules prêts pour la production",
    subtitleEnd: "dès le premier jour. Choisissez votre backend PHP ou JS, scaffoldez en 30 secondes, et livrez les fonctionnalités qui comptent vraiment pour vos utilisateurs.",
    ctaPrimary: "Démarrer gratuitement",
    ctaSecondary: "bunx create-headless-app",
    freeOpenSource: "Gratuit & open source",
    threeBackends: "3 backends, 2 frontends",
    authIncluded: "Auth + 2FA + OAuth inclus",
    secureBff: "Couche proxy BFF sécurisée",
    worksWith: "Compatible avec"
  },
  // ── Social Proof ──
  socialProof: {
    backendFrameworks: "Frameworks Backend",
    backendDetail: "Laravel · Symfony · Hono",
    frontendOptions: "Options Frontend",
    frontendDetail: "Next.js · TanStack Start",
    productionModules: "Modules Production",
    modulesDetail: "Auth · Shop · SaaS · Support",
    apiEndpoints: "Endpoints API",
    endpointsDetail: "Testes & documentes",
    builtWith: "Construit avec"
  },
  // ── Features ──
  features: {
    eyebrow: "Pourquoi Headless Kit",
    title: "Des semaines de boilerplate.",
    titleAccent: "Terminées.",
    subtitle: "Toutes les fonctionnalités que vous auriez construites vous-même — mais testées, documentées et prêtes à personnaliser.",
    items: [
      { title: "Changez de backend en quelques minutes", description: "Laravel, Symfony ou Hono — même contrat API, mêmes modules, même frontend. Changez sans réécrire une seule ligne de code UI." },
      { title: "Votre API reste privée", description: "Le proxy BFF streaming transmet les réponses en zero-copy, limite le débit sur les endpoints d'auth, et déduplique le rafraîchissement des tokens automatiquement. Votre backend n'est jamais exposé au navigateur." },
      { title: "Une auth qui marche vraiment", description: "Login, inscription, 2FA, OAuth, réinitialisation de mot de passe, refresh tokens — câblé sur les 3 backends et les 2 frontends. Testé avec plus de 180 endpoints." },
      { title: "RBAC sans prise de tête", description: "Trois rôles par défaut, permissions granulaires, tableau de bord admin — le tout intégré. Fini d'écrire des middlewares de permissions pour la 10e fois." },
      { title: "Typage de bout en bout", description: "Types TypeScript partagés entre frontend et BFF. Validation Zod côté API. Si ça compile, ça marche." },
      { title: "Livrez au jour 1, pas au mois 3", description: "Configs Docker, pipelines CI, rate limiting, headers de sécurité, logging structuré — toute l'infrastructure de production, prête à l'emploi." }
    ]
  },
  // ── Modules ──
  modules: {
    eyebrow: "Modules",
    title: "Quatre modules.",
    titleAccent: "Zero boilerplate.",
    subtitle: "Chaque module inclut API backend, UI frontend, server actions et tableau de bord admin. Prenez ceux dont vous avez besoin. Ignorez les autres.",
    auth: {
      name: "Auth & RBAC",
      tagline: "Du login à la production en minutes, pas en semaines",
      features: [
        "Email/mot de passe + OAuth (Google, GitHub)",
        "Authentification à deux facteurs (TOTP)",
        "Réinitialisation de mot de passe avec tokens sécurisés",
        "Contrôle d'accès par rôles (admin, manager, utilisateur)",
        "Permissions granulaires (ressource:action)",
        "Rotation des refresh tokens avec renouvellement proactif"
      ]
    },
    shop: {
      name: "E-commerce",
      tagline: "Du catalogue produit au checkout — bouclé",
      features: [
        "Catalogue produit avec catégories & recherche",
        "Panier persistant (côté serveur)",
        "Gestion des commandes avec suivi de statut",
        "Contrôle des stocks avec alertes",
        "Gestion clients & segmentation",
        "Tableau de bord admin avec analytique des ventes"
      ]
    },
    saas: {
      name: "SaaS Multi-Tenant",
      tagline: "Organisations, facturation et équipes — intégrés",
      features: [
        "Multi-org avec adhésion par rôles",
        "Gestion des plans & abonnements",
        "Suivi de consommation avec limites souples/strictes",
        "Invitations d'équipe avec flux email",
        "Isolation des données par organisation",
        "Tableau de bord facturation avec historique"
      ]
    },
    support: {
      name: "Centre de support",
      tagline: "Un support client qui fonctionne vraiment",
      features: [
        "Système de tickets par conversation",
        "File d'attente agents avec attribution & prise en charge",
        "Réponses prédefinies pour des réponses rapides",
        "Notes de satisfaction client",
        "Niveaux de priorité & suivi de statut",
        "Analytique support & temps de réponse"
      ]
    }
  },
  // ── Architecture ──
  architecture: {
    eyebrow: "Architecture",
    titlePre: "Le",
    titleAccent: "Pattern BFF",
    titlePost: "visualisé",
    client: "Client",
    nextjs: "Next.js App Router",
    tanstack: "TanStack Start",
    https: "HTTPS",
    bffProxy: "Proxy BFF",
    routeHandlers: "Route Handlers /api/v1/*",
    tokenAuth: "Auth Token",
    sessionMgmt: "Gestion de session",
    rateLimiting: "Rate Limiting",
    bearer: "Bearer",
    backendApi: "API Backend",
    bottomNote: "Le navigateur ne contacte jamais les backends directement. Toutes les requêtes sont streamées via le BFF avec pass-through zero-copy, rate limiting sur les endpoints d'auth, et déduplication automatique du refresh."
  },
  // ── QuickStart ──
  quickStart: {
    eyebrow: "Démarrage rapide",
    title: "Opérationnel en",
    titleAccent: "30 secondes",
    requires: "Nécessite",
    bun: "bun",
    systemNote: "v1.0+. Fonctionne sur macOS, Linux et WSL."
  },
  // ── Pricing ──
  pricing: {
    eyebrow: "Tarifs",
    title: "Un seul prix.",
    titleAccent: "Pas d'abonnement.",
    subtitle: "Payez une fois, livrez pour toujours. Commencez gratuitement avec les bases, ou débloquez tout le stack pour le prix de quelques heures de freelance.",
    mostPopular: "Le plus populaire",
    trustGuarantee: "Garantie satisfait ou remboursé 30 jours",
    trustStripe: "Paiement sécurisé via Stripe",
    trustAccess: "Accès immédiat après achat",
    checkoutError: "Une erreur est survenue. Veuillez réessayer.",
    starter: {
      name: "Starter",
      price: "Gratuit",
      period: "pour toujours",
      description: "Démarrez avec les bases. Idéal pour apprendre et prototyper.",
      cta: "Démarrer gratuitement",
      features: [
        "1 backend (Hono uniquement)",
        "1 frontend (Next.js)",
        "Module Auth (login, inscription, déconnexion)",
        "RBAC basique (2 rôles : admin, utilisateur)",
        "Support communautaire Discord",
        "Accès à la documentation"
      ],
      limits: [
        "Pas de 2FA / OAuth / réinitialisation de mot de passe",
        "Pas de modules Shop, SaaS ou Support",
        "Pas de templates premium",
        "Pas de support par email"
      ]
    },
    pro: {
      name: "Pro",
      price: "$79",
      period: "paiement unique",
      description: "La boîte à outils complète pour livrer de vrais produits. La plupart des développeurs commencent ici.",
      cta: "Acheter Pro — $79",
      features: [
        "Les 3 backends (Laravel, Symfony, Hono)",
        "Les 2 frontends (Next.js, TanStack Start)",
        "Les 4 modules (Auth, Shop, SaaS, Support)",
        "Auth complète : 2FA, OAuth, réinitialisation de mot de passe, refresh tokens",
        "RBAC complet avec permissions granulaires",
        "Proxy BFF avec transmission de token",
        "Scaffolding CLI + tous les presets",
        "Support email prioritaire (48h)",
        "1 an de mises à jour inclus"
      ]
    },
    business: {
      name: "Business",
      price: "$199",
      period: "paiement unique",
      description: "Tout ce qu'offre Pro, plus des intégrations premium et un support dédié.",
      cta: "Acheter Business — $199",
      includesProPlus: "Tout ce qu'offre Pro, plus :",
      features: [
        "Intégration Stripe (paiements, abonnements, webhooks)",
        "Assistant IA (assistant-ui + Vercel AI SDK)",
        "Templates premium pour le tableau de bord admin",
        "Templates d'emails (Resend / Mailgun)",
        "Analytique avancée & reporting",
        "Configs Docker production + pipelines CI/CD",
        "Conseil architecture (1h incluse)",
        "Canal Discord dédié",
        "Support prioritaire (SLA 24h)",
        "Mises à jour à vie"
      ]
    }
  },
  // ── FAQ ──
  faq: {
    eyebrow: "FAQ",
    title: "Questions",
    titleAccent: "fréquentes",
    items: [
      { q: "Quelle est la différence entre Starter, Pro et Business ?", a: "Starter est gratuit mais limité — 1 backend (Hono), auth basique uniquement, pas de 2FA/OAuth, pas de modules Shop/SaaS/Support. Pro ($79) débloque TOUS les backends, TOUS les frontends, TOUS les modules avec l'auth complète (2FA, OAuth, réinitialisation de mot de passe, RBAC). Business ($199) ajoute les intégrations premium : paiements Stripe, Assistant IA, templates d'emails, analytique, configs Docker production et support dédié." },
      { q: "C'est un abonnement ?", a: "Non. Pro ($79) et Business ($199) sont des paiements uniques. Pro inclut 1 an de mises à jour, Business inclut les mises à jour à vie. Après la période de mise à jour, votre code fonctionne toujours — vous arrêterez simplement de recevoir les nouvelles fonctionnalités sauf renouvellement." },
      { q: "Puis-je utiliser la version Starter gratuite à des fins commerciales ?", a: "Oui. Starter est sous licence MIT — utilisez-le pour vos projets clients, prototypes ou pour apprendre. Mais il est volontairement limité. Pour de vrais projets en production, Pro à $79 est rentabilisé dès la première heure de temps de développement économisé." },
      { q: "Quel backend choisir ?", a: "Si vous êtes développeur PHP : Laravel pour un développement rapide avec Eloquent, Symfony pour une architecture enterprise-grade avec Doctrine. Si vous voulez du full JavaScript : Hono sur Bun est l'option la plus rapide. Les trois implémentent le même contrat API, vous pouvez donc changer plus tard." },
      { q: "Ai-je besoin de Next.js et TanStack Start ?", a: "Non, choisissez-en un. Next.js est le choix recommandé — il inclut la couche proxy BFF avec protection CSRF, transmission de token et rafraîchissement automatique des tokens. TanStack Start est une alternative plus légère pour des déploiements plus simples." },
      { q: "Comment fonctionne le pattern BFF ?", a: "Le navigateur ne communique jamais directement avec votre backend. Toutes les requêtes API passent par une couche proxy Next.js qui ajoute les headers d'authentification, valide les jetons CSRF, gère le rafraîchissement des tokens et limite le débit des requêtes. Votre API backend reste entièrement privée." },
      { q: "Puis-je ajouter mes propres modules ?", a: "Oui. Chaque module suit une Vertical Slice Architecture — créez simplement un nouveau répertoire feature dans votre backend et frontend. La documentation inclut un guide pas à pas pour créer des modules personnalisés." },
      { q: "Et si j'ai besoin d'aide ou si je suis bloqué ?", a: "Les utilisateurs Starter bénéficient du support communautaire sur Discord. Les utilisateurs Pro ont un support email prioritaire avec un délai de réponse de 48h. Business dispose d'un canal Discord dédié avec un SLA de 24h." },
      { q: "Proposez-vous des remboursements ?", a: "Oui — garantie satisfait ou remboursé 30 jours sur Pro et Business, sans condition. Envoyez un email à hello@headlesskit.dev pour un remboursement intégral." }
    ]
  },
  // ── CTA Banner ──
  cta: {
    eyebrow: "Prêt ?",
    title: "Arrêtez de reconstruire la même stack.",
    titleAccent: "Commencez à livrer des fonctionnalités.",
    subtitle: "Auth, paiements, RBAC, multi-tenancy — tout est là. Choisissez votre backend, scaffoldez en 30 secondes, et concentrez-vous sur ce qui rend votre produit unique.",
    ctaPrimary: "Démarrer gratuitement",
    ctaSecondary: "Voir les fonctionnalités Pro",
    freeNote: "Gratuit pour toujours. Pas de carte bancaire requise."
  },
  // ── Footer ──
  footer: {
    brand: "Headless Kit",
    tagline: "Le starter kit full-stack pour les développeurs qui préfèrent livrer des fonctionnalités plutôt que reconstruire l'auth.",
    product: "Produit",
    resources: "Ressources",
    documentation: "Documentation",
    contact: "Contact",
    supportNote: "Support prioritaire pour Pro & Business",
    copyright: "Headless Kit. Open source sous licence MIT.",
    builtBy: "Construit par des développeurs, pour des développeurs."
  },
  // ── Auth ──
  auth: {
    signIn: "Connexion",
    signInSubtitle: "Bon retour parmi nous. Entrez vos identifiants pour continuer.",
    createAccount: "Créer un compte",
    createAccountSubtitle: "Rejoignez Headless Kit. Commencez à créer des apps full-stack dès aujourd'hui.",
    email: "Email",
    emailPlaceholder: "vous@exemple.com",
    password: "Mot de passe",
    passwordPlaceholder: "••••••••",
    confirmPassword: "Confirmer le mot de passe",
    repeatPassword: "Répétez le mot de passe",
    minChars: "Min. 8 caractères",
    name: "Nom",
    namePlaceholder: "Votre nom",
    signingIn: "Connexion en cours...",
    creatingAccount: "Création du compte...",
    or: "OU",
    noAccount: "Pas encore de compte ?",
    createOne: "Créer un compte",
    hasAccount: "Vous avez déjà un compte ?",
    signInLink: "Se connecter",
    continueWithGoogle: "Continuer avec Google",
    signUpWithGoogle: "S'inscrire avec Google",
    redirecting: "Redirection...",
    invalidCredentials: "Identifiants invalides. Veuillez réessayer.",
    registrationFailed: "L'inscription a échoué. Veuillez réessayer.",
    unexpectedError: "Une erreur inattendue est survenue. Veuillez réessayer.",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordsMismatch: "Les mots de passe ne correspondent pas.",
    devAutofill: "Remplissage dev",
    devAdmin: "Admin",
    devCustomerPro: "Client (Pro)",
    devCustomerBusiness: "Client (Business)",
    devFillRandom: "Remplir un utilisateur aléatoire"
  },
  // ── Dashboard ──
  dashboard: {
    title: "Tableau de bord",
    welcomeBack: "Bon retour,",
    account: "Compte",
    overview: "Vue d'ensemble",
    license: "Licence",
    downloads: "Téléchargements",
    billing: "Facturation",
    documentation: "Documentation",
    backToSite: "Retour au site",
    signOut: "Déconnexion",
    administration: "Administration",
    users: "Utilisateurs",
    licenses: "Licences",
    revenue: "Revenus",
    settings: "Paramètres",
    noLicense: "Aucune licence active",
    upgrade: "Passer à la version supérieure",
    upgradeSubtitle: "Passez à la version supérieure pour débloquer les fonctionnalités premium.",
    licenseTier: "Niveau de licence",
    status: "Statut",
    active: "Active",
    expired: "Expirée",
    revoked: "Révoquée",
    created: "Créée le",
    expires: "Expire le",
    lifetime: "À vie",
    neverExpires: "N'expire jamais",
    copyKey: "Copier",
    copied: "Copié !",
    manageLicense: "Gérez votre clé de licence.",
    cliInstall: "Commande d'installation CLI",
    premiumTemplates: "Templates Premium",
    dockerConfigs: "Configs Docker",
    cicdPipelines: "Pipelines CI/CD",
    requiresPro: "Nécessite une licence Pro ou Business",
    requiresBusiness: "Nécessite une licence Business",
    currentPlan: "Plan actuel",
    price: "Prix",
    stripePortal: "Gérer sur Stripe",
    purchaseHistory: "Historique d'achat"
  },
  // ── Admin ──
  admin: {
    overview: "Vue d'ensemble admin",
    overviewSubtitle: "Statistiques de la plateforme en un coup d'œil.",
    totalUsers: "Utilisateurs totaux",
    totalLicenses: "Licences totales",
    totalRevenue: "Revenu total",
    activeLicenses: "Licences actives",
    recentSignups: "Inscriptions récentes",
    expiringLicenses: "Licences expirant bientôt",
    recentLicenses: "Licences récentes",
    noExpiringLicenses: "Aucune licence n'expire bientôt.",
    usersTitle: "Utilisateurs",
    usersSubtitle: "Gérer les utilisateurs de la plateforme.",
    searchPlaceholder: "Rechercher par nom ou email...",
    search: "Rechercher",
    all: "Tous",
    admins: "Admins",
    customers: "Clients",
    role: "Rôle",
    verified: "Vérifié",
    actions: "Actions",
    view: "Voir",
    promote: "Promouvoir",
    demote: "Rétrograder",
    deleteUser: "Supprimer l'utilisateur",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.",
    makeAdmin: "Passer admin",
    makeCustomer: "Passer client",
    userDetail: "Détail utilisateur",
    userManagement: "Gestion des utilisateurs",
    changeRole: "Changer le rôle",
    sessions: "Sessions",
    killSession: "Terminer",
    ipAddress: "Adresse IP",
    userAgent: "User Agent",
    licensesTitle: "Licences",
    licensesSubtitle: "Gérer les clés de licence.",
    createLicense: "Créer une licence",
    createLicenseTitle: "Créer une licence manuelle",
    createLicenseSubtitle: "Émettre une clé de licence pour un utilisateur.",
    userEmail: "Email utilisateur",
    tier: "Niveau",
    licenseKey: "Clé de licence",
    expiry: "Expiration",
    oneYear: "1 an",
    revoke: "Révoquer",
    reactivate: "Réactiver",
    extend: "Prolonger +1an",
    create: "Créer",
    revenueTitle: "Revenus",
    revenueSubtitle: "Vue d'ensemble financière.",
    proRevenue: "Revenus Pro",
    businessRevenue: "Revenus Business",
    openStripe: "Ouvrir le tableau de bord Stripe",
    allPurchases: "Tous les achats",
    settingsTitle: "Paramètres",
    settingsSubtitle: "Configuration de la plateforme.",
    pricingPlans: "Plans tarifaires",
    authentication: "Authentification",
    environment: "Environnement",
    dangerZone: "Zone de danger",
    killAllSessions: "Terminer toutes les sessions",
    killAllConfirm: "Cela déconectera tous les utilisateurs, vous compris. Êtes-vous sûr ?",
    siteUrl: "URL du site",
    mode: "Mode",
    production: "Production",
    development: "Développement",
    database: "Base de données",
    emailPassword: "Email + Mot de passe",
    enabled: "Active",
    googleOAuth: "Google OAuth",
    configured: "Configuré",
    notConfigured: "Non configuré",
    minPassword: "Longueur minimale du mot de passe",
    characters: "caractères",
    previous: "Précédent",
    next: "Suivant",
    page: "Page",
    of: "sur",
    showing: "Affichage de",
    results: "résultats"
  },
  // ── Docs chrome ──
  docs: {
    onThisPage: "Sur cette page",
    previous: "Precedent",
    next: "Suivant",
    toggleSidebar: "Basculer la barre laterale"
  },
  // ── Language switcher ──
  lang: {
    switchTo: "EN",
    current: "FR"
  }
};

const messages = { en, fr };
function getMessages(locale) {
  return messages[locale] || messages.en;
}
function getLocale(astroLocale) {
  return astroLocale === "fr" ? "fr" : "en";
}
function switchLocalePath(currentPath, currentLocale) {
  if (currentLocale === "en") {
    return `/fr${currentPath}`;
  }
  return currentPath.replace(/^\/fr/, "") || "/";
}

const $$Astro$1 = createAstro("https://headlesskit.dev");
const $$HreflangTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$HreflangTags;
  const currentPath = Astro2.url.pathname;
  const basePath = currentPath.replace(/^\/fr/, "") || "/";
  const site = Astro2.site?.origin || "https://headlesskit.dev";
  return renderTemplate`<link rel="alternate" hreflang="en"${addAttribute(`${site}${basePath}`, "href")}><link rel="alternate" hreflang="fr"${addAttribute(`${site}/fr${basePath}`, "href")}><link rel="alternate" hreflang="x-default"${addAttribute(`${site}${basePath}`, "href")}>`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/HreflangTags.astro", void 0);

const $$Astro = createAstro("https://headlesskit.dev");
const $$SEOHead = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$SEOHead;
  const {
    title,
    description,
    image = "/og-image.png",
    url = Astro2.url.href,
    type = "website"
  } = Astro2.props;
  const siteName = "Headless Kit";
  const fullImageUrl = new URL(image, Astro2.site || "https://headlesskit.dev").href;
  return renderTemplate`<!-- Primary Meta --><meta name="description"${addAttribute(description, "content")}><!-- Open Graph --><meta property="og:type"${addAttribute(type, "content")}><meta property="og:url"${addAttribute(url, "content")}><meta property="og:title"${addAttribute(title, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:image"${addAttribute(fullImageUrl, "content")}><meta property="og:site_name"${addAttribute(siteName, "content")}><meta property="og:locale"${addAttribute(Astro2.currentLocale === "fr" ? "fr_FR" : "en_US", "content")}><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(title, "content")}><meta name="twitter:description"${addAttribute(description, "content")}><meta name="twitter:image"${addAttribute(fullImageUrl, "content")}><!-- Canonical --><link rel="canonical"${addAttribute(url, "href")}><!-- Hreflang -->${renderComponent($$result, "HreflangTags", $$HreflangTags, {})}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/components/SEOHead.astro", void 0);

export { $$SEOHead as $, getMessages as a, getLocale as g, switchLocalePath as s };
