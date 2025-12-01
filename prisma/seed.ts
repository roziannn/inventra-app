import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const suppliers = [
    // ===== Distributor Nasional =====
    "PT Astrindo Senayasa",
    "PT Synnex Metrodata Indonesia",
    "PT ECS Indo Jaya",
    "PT Virtus Technology Indonesia",
    "PT Datascript",
    "PT Jagat Genta Teknik",
    "PT Nusantara Jaya Computer",
    "PT Cakra Adi Jaya",
    "PT Citra Mandiri",
    "PT Berca Hardayaperkasa",
    "PT Computrade Technology International (CTI Group)",

    // ===== Supplier Lokal =====
    "MegaTech Supplies",
    "Indo Komputer Mandiri",
    "Global Hardware Supply",
    "Digital Partner Indonesia",
    "Sumber Jaya Komputer",
    "Prima Teknologi Nusantara",
    "Multi Data Pratama",
    "Alpha Computer Parts",
    "Techno Jaya Hardware",
    "Komputer Bersama Abadi",
    "Nusantara Parts Center",
    "Digital Bersaudara",
    "Elite Hardware Indonesia",
    "Anugerah Tech Supply",
    "Mitra Sukses Teknologi",

    // ===== Supplier Import =====
    "Shenzhen Tech Components Co., Ltd",
    "Guangzhou Hardware Electronic Co.",
    "Hong Kong Global Parts Ltd.",
    "Taiwan Precision Tech",
    "Shenzhen Nova Electronics",
    "Xinghua Computer Parts Factory",
    "Korea Digital Parts Co.",
    "Tokyo Hardware Supply",

    // ===== Retail Grosir =====
    "Enter Komputer",
    "Jakarta Notebook",
    "Rakitan",
    "Nana Komputer",
    "Hitech Computer",
    "Jakarta Pusat Computer Store",
    "BDG IT Supply (Bandung)",
    "Surabaya Mega Komputer",
    "Medan Jaya Technology",
  ];

  await prisma.supplier.createMany({
    data: suppliers.map((name) => ({
      id: crypto.randomUUID(),
      name,
      createdBy: "administrator@inventra.co.id",
      createdAt: new Date(),
    })),
    skipDuplicates: true,
  });

  console.log("➡️ Supplier seeding completed 🎉!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
