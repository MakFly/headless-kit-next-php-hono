/**
 * Database seed script
 *
 * Creates default roles and permissions
 */

import { db, schema } from "./index.ts";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/hash.ts";
import { seedShop } from "./seeders/shop.seed.ts";
import { seedAdmin } from "./seeders/admin.seed.ts";
import { seedSaas } from "./seeders/saas.seed.ts";
import { seedSupport } from "./seeders/support.seed.ts";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Create roles
  const rolesData = [
    { name: "Admin", slug: "admin", description: "Full system access" },
    {
      name: "Moderator",
      slug: "moderator",
      description: "Moderate content and users",
    },
    { name: "User", slug: "user", description: "Standard user access" },
  ];

  console.log("Creating roles...");
  for (const role of rolesData) {
    const existing = await db.query.roles.findFirst({
      where: eq(schema.roles.slug, role.slug),
    });

    if (!existing) {
      await db.insert(schema.roles).values({
        name: role.name,
        slug: role.slug,
        description: role.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Created role: ${role.name}`);
    } else {
      console.log(`  - Role exists: ${role.name}`);
    }
  }

  // Create permissions
  const permissionsData = [
    // User permissions
    {
      name: "Create Users",
      slug: "users:create",
      resource: "users",
      action: "create",
    },
    {
      name: "Read Users",
      slug: "users:read",
      resource: "users",
      action: "read",
    },
    {
      name: "Update Users",
      slug: "users:update",
      resource: "users",
      action: "update",
    },
    {
      name: "Delete Users",
      slug: "users:delete",
      resource: "users",
      action: "delete",
    },
    {
      name: "Manage Users",
      slug: "users:manage",
      resource: "users",
      action: "manage",
    },
    // Role permissions
    {
      name: "Create Roles",
      slug: "roles:create",
      resource: "roles",
      action: "create",
    },
    {
      name: "Read Roles",
      slug: "roles:read",
      resource: "roles",
      action: "read",
    },
    {
      name: "Update Roles",
      slug: "roles:update",
      resource: "roles",
      action: "update",
    },
    {
      name: "Delete Roles",
      slug: "roles:delete",
      resource: "roles",
      action: "delete",
    },
    {
      name: "Manage Roles",
      slug: "roles:manage",
      resource: "roles",
      action: "manage",
    },
    // Post permissions
    {
      name: "Create Posts",
      slug: "posts:create",
      resource: "posts",
      action: "create",
    },
    {
      name: "Read Posts",
      slug: "posts:read",
      resource: "posts",
      action: "read",
    },
    {
      name: "Update Posts",
      slug: "posts:update",
      resource: "posts",
      action: "update",
    },
    {
      name: "Delete Posts",
      slug: "posts:delete",
      resource: "posts",
      action: "delete",
    },
    {
      name: "Manage Posts",
      slug: "posts:manage",
      resource: "posts",
      action: "manage",
    },
  ];

  console.log("\nCreating permissions...");
  for (const perm of permissionsData) {
    const existing = await db.query.permissions.findFirst({
      where: eq(schema.permissions.slug, perm.slug),
    });

    if (!existing) {
      await db.insert(schema.permissions).values({
        name: perm.name,
        slug: perm.slug,
        resource: perm.resource,
        action: perm.action,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`  ✓ Created permission: ${perm.name}`);
    } else {
      console.log(`  - Permission exists: ${perm.name}`);
    }
  }

  // Assign permissions to roles
  console.log("\nAssigning permissions to roles...");

  // Get all roles and permissions
  const allRoles = await db.query.roles.findMany();
  const allPermissions = await db.query.permissions.findMany();

  const adminRole = allRoles.find((r) => r.slug === "admin");
  const moderatorRole = allRoles.find((r) => r.slug === "moderator");
  const userRole = allRoles.find((r) => r.slug === "user");

  // Admin gets all permissions
  if (adminRole) {
    for (const perm of allPermissions) {
      const existing = await db.query.rolePermissions.findFirst({
        where: (rp, { and, eq }) =>
          and(eq(rp.roleId, adminRole.id), eq(rp.permissionId, perm.id)),
      });

      if (!existing) {
        await db.insert(schema.rolePermissions).values({
          roleId: adminRole.id,
          permissionId: perm.id,
        });
      }
    }
    console.log(`  ✓ Admin role: all permissions`);
  }

  // Moderator gets read and update permissions
  if (moderatorRole) {
    const moderatorPerms = allPermissions.filter(
      (p) => p.action === "read" || p.action === "update",
    );

    for (const perm of moderatorPerms) {
      const existing = await db.query.rolePermissions.findFirst({
        where: (rp, { and, eq }) =>
          and(eq(rp.roleId, moderatorRole.id), eq(rp.permissionId, perm.id)),
      });

      if (!existing) {
        await db.insert(schema.rolePermissions).values({
          roleId: moderatorRole.id,
          permissionId: perm.id,
        });
      }
    }
    console.log(`  ✓ Moderator role: read + update permissions`);
  }

  // User gets read permissions only
  if (userRole) {
    const userPerms = allPermissions.filter((p) => p.action === "read");

    for (const perm of userPerms) {
      const existing = await db.query.rolePermissions.findFirst({
        where: (rp, { and, eq }) =>
          and(eq(rp.roleId, userRole.id), eq(rp.permissionId, perm.id)),
      });

      if (!existing) {
        await db.insert(schema.rolePermissions).values({
          roleId: userRole.id,
          permissionId: perm.id,
        });
      }
    }
    console.log(`  ✓ User role: read permissions`);
  }

  // Create test users
  console.log("\nCreating test users...");
  const testUsers = [
    {
      id: "admin-00000000-0000-0000-0000-000000000001",
      email: "admin@example.com",
      name: "Admin User",
      roleSlug: "admin",
      password: "Admin1234!",
    },
    {
      id: "user-00000000-0000-0000-0000-000000000002",
      email: "user@example.com",
      name: "Regular User",
      roleSlug: "user",
      password: "User1234!",
    },
  ];

  for (const userData of testUsers) {
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, userData.email),
    });

    if (existing) {
      console.log(`  - User exists: ${userData.email}`);
      continue;
    }

    const passwordHash = await hashPassword(userData.password);
    const role = allRoles.find((r) => r.slug === userData.roleSlug);

    const [user] = await db
      .insert(schema.users)
      .values({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        passwordHash,
        emailVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (role) {
      await db.insert(schema.userRoles).values({
        userId: user.id,
        roleId: role.id,
      });
    }

    console.log(`  ✓ Created user: ${userData.email} (${userData.roleSlug})`);
  }

  // Seed shop data
  await seedShop();

  // Seed admin data
  await seedAdmin();

  // Seed SaaS data
  await seedSaas();

  // Seed Support data
  await seedSupport();

  console.log("\n✅ Database seeded successfully!\n");
}

// Run seed
seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
