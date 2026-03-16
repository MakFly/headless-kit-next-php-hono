/**
 * SaaS seed script
 *
 * Creates plans, organizations, team members, subscriptions, invoices, usage records
 */

import { db, schema } from '../index.ts';
import { eq } from 'drizzle-orm';

const plansData = [
  {
    name: 'Free',
    slug: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    features: ['1 project', '100 API calls/day', '500 MB storage', 'Community support'],
    limits: { maxMembers: 1, maxProjects: 1, maxStorage: 500, apiCallsPerMonth: 3000 },
  },
  {
    name: 'Starter',
    slug: 'starter',
    priceMonthly: 900,
    priceYearly: 9000,
    features: ['5 projects', '10,000 API calls/day', '5 GB storage', 'Email support'],
    limits: { maxMembers: 5, maxProjects: 5, maxStorage: 5000, apiCallsPerMonth: 300000 },
  },
  {
    name: 'Pro',
    slug: 'pro',
    priceMonthly: 2900,
    priceYearly: 29000,
    features: ['Unlimited projects', '100,000 API calls/day', '50 GB storage', 'Priority support', 'SSO'],
    limits: { maxMembers: 25, maxProjects: 100, maxStorage: 50000, apiCallsPerMonth: 3000000 },
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    priceMonthly: 9900,
    priceYearly: 99000,
    features: ['Unlimited everything', 'Dedicated support', 'SLA guarantee', 'Custom integrations', 'SCIM'],
    limits: { maxMembers: 999, maxProjects: 999, maxStorage: 500000, apiCallsPerMonth: 99999999 },
  },
];

export async function seedSaas() {
  console.log('\nSeeding SaaS data...\n');

  // Create plans
  console.log('Creating plans...');
  const planIds: Record<string, string> = {};

  for (const plan of plansData) {
    const existing = await db.query.plans.findFirst({
      where: eq(schema.plans.slug, plan.slug),
    });

    if (existing) {
      planIds[plan.slug] = existing.id;
      console.log(`  - Plan exists: ${plan.name}`);
      continue;
    }

    const id = crypto.randomUUID();
    planIds[plan.slug] = id;

    await db.insert(schema.plans).values({
      id,
      name: plan.name,
      slug: plan.slug,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      features: plan.features,
      limits: plan.limits,
    });
    console.log(`  Created plan: ${plan.name} ($${plan.priceMonthly / 100}/mo)`);
  }

  // Create orgs for each seeded user
  console.log('\nCreating organizations...');

  const userIds = [
    'admin-00000000-0000-0000-0000-000000000001',
    'user-00000000-0000-0000-0000-000000000002',
  ];

  const orgConfigs = [
    { name: 'Acme Corp', slug: 'acme-corp', plan: 'starter' },
    { name: 'Dev Team', slug: 'dev-team', plan: 'starter' },
  ];

  // Second org for admin user (no subscription — demonstrates multi-org)
  const adminUserId = 'admin-00000000-0000-0000-0000-000000000001';
  const sideProjectSlug = 'side-project';
  const sideProjectExisting = await db.query.organizations.findFirst({
    where: eq(schema.organizations.slug, sideProjectSlug),
  });
  if (!sideProjectExisting) {
    const adminUser = await db.query.users.findFirst({
      where: eq(schema.users.id, adminUserId),
    });
    if (adminUser) {
      const sideOrgId = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.insert(schema.organizations).values({
        id: sideOrgId,
        name: 'Side Project',
        slug: sideProjectSlug,
        ownerId: adminUserId,
        planId: planIds['free'] ?? null,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(schema.teamMembers).values({
        id: crypto.randomUUID(),
        organizationId: sideOrgId,
        userId: adminUserId,
        role: 'owner',
        joinedAt: now,
      });

      console.log('  Created organization: Side Project (no subscription)');
    }
  } else {
    console.log('  - Organization exists: Side Project');
  }

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const config = orgConfigs[i];

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    });
    if (!user) {
      console.log(`  - Skipping ${config.name}: user not found`);
      continue;
    }

    const existing = await db.query.organizations.findFirst({
      where: eq(schema.organizations.slug, config.slug),
    });
    if (existing) {
      console.log(`  - Organization exists: ${config.name}`);
      continue;
    }

    const orgId = crypto.randomUUID();
    const now = new Date().toISOString();
    const planId = planIds[config.plan];

    await db.insert(schema.organizations).values({
      id: orgId,
      name: config.name,
      slug: config.slug,
      ownerId: userId,
      planId,
      createdAt: now,
      updatedAt: now,
    });

    // Add owner as team member
    await db.insert(schema.teamMembers).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId,
      role: 'owner',
      joinedAt: now,
    });

    // Add extra team members to first org
    if (i === 0) {
      for (let j = 1; j < userIds.length; j++) {
        const memberUser = await db.query.users.findFirst({
          where: eq(schema.users.id, userIds[j]),
        });
        if (memberUser) {
          await db.insert(schema.teamMembers).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: memberUser.id,
            role: j === 1 ? 'admin' : 'member',
            joinedAt: now,
          });
          console.log(`  Added ${memberUser.name} as ${j === 1 ? 'admin' : 'member'} to ${config.name}`);
        }
      }
    }

    // Create subscription
    if (planId) {
      const periodStart = new Date();
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.insert(schema.subscriptions).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        planId,
        status: 'active',
        currentPeriodStart: periodStart.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        createdAt: now,
      });
      console.log(`  Subscribed ${config.name} to ${config.plan} plan`);
    }

    // Create 5 invoices (past months)
    const plan = plansData.find((p) => p.slug === config.plan);
    if (plan) {
      for (let m = 4; m >= 0; m--) {
        const invoiceStart = new Date();
        invoiceStart.setMonth(invoiceStart.getMonth() - m);
        invoiceStart.setDate(1);
        const invoiceEnd = new Date(invoiceStart);
        invoiceEnd.setMonth(invoiceEnd.getMonth() + 1);

        await db.insert(schema.invoices).values({
          id: crypto.randomUUID(),
          organizationId: orgId,
          amount: plan.priceMonthly,
          status: m === 0 ? 'pending' : 'paid',
          periodStart: invoiceStart.toISOString(),
          periodEnd: invoiceEnd.toISOString(),
          paidAt: m === 0 ? null : invoiceStart.toISOString(),
          createdAt: invoiceStart.toISOString(),
        });
      }
      console.log(`  Created 5 invoices for ${config.name}`);
    }

    // Create usage records
    const usageMetrics = [
      { metric: 'api_calls', value: Math.floor(Math.random() * 5000) + 500, limitValue: 300000 },
      { metric: 'storage', value: Math.floor(Math.random() * 2000) + 100, limitValue: 5000 },
      { metric: 'members', value: i === 0 ? 2 : 1, limitValue: 5 },
      { metric: 'projects', value: Math.floor(Math.random() * 4) + 1, limitValue: 5 },
    ];

    for (const usage of usageMetrics) {
      await db.insert(schema.usageRecords).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        metric: usage.metric,
        value: usage.value,
        limitValue: usage.limitValue,
        recordedAt: now,
      });
    }
    console.log(`  Added usage records for ${config.name}`);

    console.log(`  Created organization: ${config.name}`);
  }

  console.log('\nSaaS data seeded successfully!\n');
}

// Run standalone
if (import.meta.main) {
  seedSaas().catch((error) => {
    console.error('SaaS seed failed:', error);
    process.exit(1);
  });
}
