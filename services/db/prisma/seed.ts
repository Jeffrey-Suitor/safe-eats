import { prisma } from "../index";

async function main() {
  await prisma.qRCode.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appliance.deleteMany();
  await seedUsers();
  await seedAppliances();
  await seedRecipes();
  await seedQrCodes();
}
const seedQrCodes = async () => {
  const qrCode1 = await prisma.qRCode.create({
    data: {
      id: "bd5b49a9-33c9-48b7-b386-484298cf446a",
      recipeId: "a62aa609-63d2-47dd-af75-e425d8e82c0a",
    },
  });
  const qrCode2 = await prisma.qRCode.create({
    data: {
      id: "23520e20-9b12-4251-9dbf-a02a24936858",
      recipeId: "00000000-99d5-432f-96aa-bdd345f320b8",
    },
  });
  console.log("QR Codes seeded: ", qrCode1, qrCode2);
};

const seedAppliances = async () => {
  const appliance1 = await prisma.appliance.create({
    data: {
      id: "98CDACF7EA58",
      BLEId: "98:CD:AC:F7:EA:5A",
      name: "Toaster Oven",
      type: "Toaster_Oven",
      temperatureC: 200,
      temperatureF: 400,
      users: {
        connect: {
          id: "f62bc609-63d2-47dd-af75-e425d8e82c0a",
        },
      },
    },
  });

  const appliance2 = await prisma.appliance.create({
    data: {
      id: "z1z2z3z4-e5f6-7g8h-9i0j-1k2l3m4n5o6z",
      BLEId: "z1z2z3z4-e5f6-7g8h-9i0j-1k2l3m4n5o6z",
      name: "Toaster Oven 2",
      type: "Toaster_Oven",
      temperatureC: 300,
      temperatureF: 600,
      cookingStartTime: new Date().toISOString(),
      recipeId: "00000000-99d5-432f-96aa-bdd345f320b8",
    },
  });

  const appliance3 = await prisma.appliance.create({
    data: {
      id: "z3z2z3z4-e5f6-7g8h-9i0j-1k2l3m4n5o6z",
      BLEId: "z3z2z3z4-e5f6-7g8h-9i0j-1k2l3m4n5o6z",
      name: "Toaster Oven 3",
      type: "Toaster_Oven",
      temperatureC: 300,
      temperatureF: 600,
      cookingStartTime: new Date().toISOString(),
      recipeId: "00000000-99d5-432f-96aa-bdd345f320b8",
    },
  });

  console.log("Appliances seeded: ", appliance1, appliance2, appliance3);
};

const seedUsers = async () => {
  const user1 = await prisma.user.create({
    data: {
      id: "f62bc609-63d2-47dd-af75-e425d8e82c0a",
      email: "jeffreysuitor117@gmail.com",
      name: "jeff",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      id: "2823da8e-99d5-432f-96aa-bdd345f320b8",
      email: "jeff2@gmail.com",
      name: "jeff2",
    },
  });
  console.log("Users seeded: ", user1, user2);
};

const seedRecipes = async () => {
  const chickenAlfredo = await prisma.recipe.create({
    data: {
      id: "a62aa609-63d2-47dd-af75-e425d8e82c0a",
      name: "Chicken Alfredo",
      description: "Moms' favourite",
      cookingTime: 600,
      expiryDate: 259200,
      applianceType: "Toaster_Oven",
      temperature: 325,
      temperatureUnit: "F",
      applianceMode: "Convection",
    },
  });
  const steak = await prisma.recipe.create({
    data: {
      id: "00000000-99d5-432f-96aa-bdd345f320b8",
      name: "Steak",
      description: "Always tasty",
      cookingTime: 1200,
      expiryDate: 432000,
      applianceType: "Toaster_Oven",
      temperature: 200,
      temperatureUnit: "F",
      applianceMode: "Bake",
    },
  });

  const recipes = [];

  for (let i = 0; i < 10; i++) {
    recipes.push(i);
  }

  await prisma.recipe.createMany({
    data: recipes.map((i) => ({
      id: `${i}0000000-99d6-432f-96aa-bdd345f320b8`,
      name: `Spaghetti ${i}`,
      description: "Always tasty",
      cookingTime: 120000,
      expiryDate: 60000 * 10,
      applianceType: "Toaster_Oven" as any,
      temperature: 200,
      temperatureUnit: "F" as any,
      applianceMode: "Bake" as any,
    })),
  });

  await Promise.all(
    recipes.map((i) =>
      prisma.recipe.update({
        where: {
          id: `${i}0000000-99d6-432f-96aa-bdd345f320b8`,
        },
        data: {
          users: {
            connect: {
              id: "f62bc609-63d2-47dd-af75-e425d8e82c0a",
            },
          },
        },
      })
    )
  );

  console.log("Recipes seeded: ", chickenAlfredo, steak, recipes);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
