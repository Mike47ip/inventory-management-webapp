import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const newProduct = await prisma.products.create({
    data: {
      name: 'New Product',
      price: 99.99,
      stockQuantity: 100,
    },
  });

  console.log('New product added:', newProduct);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
