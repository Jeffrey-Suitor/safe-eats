import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.qRCode.deleteMany();
  await prisma.recipe.deleteMany();

  const chickenAlfredo = await prisma.recipe.create({
    data: {
      id: "f62bc609-63d2-47dd-af75-e425d8e82c0a",
      name: "Chicken Alfredo",
      description: "Moms' favourite",
      cookingTime: 600,
      expiryDate: 259200,
      appliance: "Toaster_Oven",
      temperature: 325,
      temperatureUnit: "F",
      applianceMode: "Convection",
    },
  });
  const steak = await prisma.recipe.create({
    data: {
      id: "2823da8e-99d5-432f-96aa-bdd345f320b8",
      name: "Steak",
      description: "Always tasty",
      cookingTime: 1200,
      expiryDate: 432000,
      appliance: "Toaster_Oven",
      temperature: 200,
      temperatureUnit: "F",
      applianceMode: "Bake",
    },
  });
  console.log("Recipes seeded: ", chickenAlfredo, steak);

  const qrCode1 = await prisma.qRCode.create({
    data: {
      id: "bd5b49a9-33c9-48b7-b386-484298cf446a",
      recipeId: "f62bc609-63d2-47dd-af75-e425d8e82c0a",
    },
  });
  const qrCode2 = await prisma.qRCode.create({
    data: {
      id: "23520e20-9b12-4251-9dbf-a02a24936858",
      recipeId: "2823da8e-99d5-432f-96aa-bdd345f320b8",
    },
  });
  console.log("QR Codes seeded: ", qrCode1, qrCode2);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
