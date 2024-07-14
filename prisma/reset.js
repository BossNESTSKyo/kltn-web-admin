const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`; // Đặt tên bảng của bạn ở đây

  // Seed lại dữ liệu
  await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
