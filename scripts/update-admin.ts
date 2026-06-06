import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const newEmail = "admin@gmail.com";
  const newPassword = "123";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    const created = await prisma.user.create({
      data: {
        name: "Admin",
        email: newEmail,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin criado com email: ${created.email}`);
  } else {
    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: newEmail,
        password: hashedPassword,
      },
    });
    console.log(`✅ Admin atualizado: ${updated.email}`);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("Erro:", e);
  process.exit(1);
});
