/**
 * Seed script: (1) creates admin user from env; (2) adds dummy pet data for demo.
 * Run: npx prisma db seed
 * Admin: set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env — this account is for /admin/login only (separate from user signup).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "test@gmail.com";
const DEMO_PASSWORD = "demo12345";

async function main() {
  // —— Admin user (separate from normal signup): use only at /admin/login ——
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 8) {
    const adminHash = bcrypt.hashSync(adminPassword, 10);
    const existingAdmin = await prisma.user.findFirst({
      where: { email: adminEmail },
    });
    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          passwordHash: adminHash,
          role: "ADMIN",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          isActive: true,
          deletedAt: null,
        },
      });
      console.log("Updated admin user:", adminEmail);
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: adminHash,
          role: "ADMIN",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          isActive: true,
        },
      });
      console.log("Created admin user:", adminEmail);
    }
  } else if (adminEmail || adminPassword) {
    console.warn("ADMIN_EMAIL and ADMIN_PASSWORD must both be set (password at least 8 chars). Skipping admin seed.");
  }

  // —— Authorised person (Reg 7(1)(e)): dog wardens, vets – can only do microchip look-up ——
  const authorisedEmail = process.env.AUTHORISED_EMAIL?.trim();
  const authorisedPassword = process.env.AUTHORISED_PASSWORD;
  if (authorisedEmail && authorisedPassword && authorisedPassword.length >= 8) {
    const authHash = bcrypt.hashSync(authorisedPassword, 10);
    const existingAuth = await prisma.user.findFirst({
      where: { email: authorisedEmail },
    });
    if (existingAuth) {
      await prisma.user.update({
        where: { id: existingAuth.id },
        data: { passwordHash: authHash, role: "AUTHORISED", emailVerified: true, emailVerifiedAt: new Date(), isActive: true, deletedAt: null },
      });
      console.log("Updated authorised user:", authorisedEmail);
    } else {
      await prisma.user.create({
        data: {
          email: authorisedEmail,
          passwordHash: authHash,
          role: "AUTHORISED",
          emailVerified: true,
          emailVerifiedAt: new Date(),
          isActive: true,
        },
      });
      console.log("Created authorised user:", authorisedEmail);
    }
  }

  // —— Demo user + pets (for main site) ——
  let user = await prisma.user.findFirst({
    where: { email: DEMO_EMAIL, deletedAt: null },
  });

  if (!user) {
    const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        passwordHash,
        role: "USER",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
        firstName: "Demo",
        lastName: "User",
        phone: "+44 7700 900123",
        postcode: "W8 5QR",
      },
    });
    console.log("Created demo user:", user.email);
  }

  const existingPets = await prisma.pet.count({ where: { userId: user.id } });
  if (existingPets > 0) {
    console.log("Demo user already has", existingPets, "pet(s). Skipping pet seed.");
    return;
  }

  await prisma.pet.createMany({
    data: [
      {
        userId: user.id,
        microchipNumber: "977200009123456",
        microchipSearchKey: "977200009123456",
        name: "Bella",
        species: "dog",
        breed: "Golden Retriever",
        color: "Golden",
        dateOfBirth: new Date("2020-03-15"),
        sex: "female",
        neutered: true,
        notes: "Very friendly, loves swimming.",
        imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
        status: "registered",
      },
      {
        userId: user.id,
        microchipNumber: "977200009654321",
        microchipSearchKey: "977200009654321",
        name: "Max",
        species: "cat",
        breed: "British Shorthair",
        color: "Grey",
        dateOfBirth: new Date("2021-07-20"),
        sex: "male",
        neutered: true,
        notes: "Indoor cat, shy with strangers.",
        status: "registered",
      },
      {
        userId: user.id,
        microchipNumber: "977200009111222",
        microchipSearchKey: "977200009111222",
        name: "Luna",
        species: "dog",
        breed: "Labrador",
        color: "Black",
        dateOfBirth: new Date("2019-11-01"),
        sex: "female",
        neutered: true,
        status: "registered",
      },
    ],
  });

  console.log("Added 3 dummy pets for demo user. Login with", DEMO_EMAIL, "and password:", DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
