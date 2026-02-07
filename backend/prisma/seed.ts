/**
 * Seed script: adds dummy pet data for demo purposes.
 * Run: npx prisma db seed
 * Use this so the client can see how the design looks. For production, use a clean DB or skip seeding.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "test@gmail.com";
const DEMO_PASSWORD = "demo12345";

async function main() {
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
