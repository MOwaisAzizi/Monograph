import mongoose from "mongoose";
import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import Item from "../models/itemModel.js";

/**
 * SCHEMA NOTES — confirmed / still-assumed shapes:
 *
 * 1. translationSchema.js
 *    - `multipleFields` (used by Shop, Item) — CONFIRMED:
 *        { en: { title, description? }, fa: {...}, ps: {...} }
 *    - `singleField` (used by Category) — CONFIRMED nested like
 *      multipleFields, just without `description`:
 *        { en: { title }, fa: { title }, ps: { title } }
 *
 * 2. locationSchema.js
 *    - `address` remains OMITTED until you share locationSchema.js.
 *    - Coordinate order assumed [lng, lat] (GeoJSON) — CONFIRM.
 *
 * 3. mediaSchema.js / workingHoursModel.js — still unpopulated (see prior notes).
 *
 * 4. RELATIONSHIP FLIP (this version): `Shop.category` is now the
 *    optional single reference. Categories are seeded before shops.
 *
 *    Since a shop can point to one category, category definitions can share a shop type.
 *    (e.g. mobile_store -> "Phones & Tablets" AND "Phone Accessories"),
 *    Each shop is assigned the first category listed for its type.
 */

const HERAT_COORDS = [62.199, 34.348]; // [lng, lat] — CONFIRM against locationSchema

function heratLocation() {
  return { type: "Point", coordinates: HERAT_COORDS };
}

/** multipleFields: nested { title, description } per language. */
function tf(titleEn, titleFa, titlePs, descEn, descFa, descPs) {
  return {
    en: { title: titleEn, description: descEn },
    fa: { title: titleFa, description: descFa },
    ps: { title: titlePs || titleEn, description: descPs || descEn },
  };
}

/** singleField: nested { title } per language. */
function sf(titleEn, titleFa, titlePs) {
  return {
    en: { title: titleEn },
    fa: { title: titleFa },
    ps: { title: titlePs || titleEn },
  };
}

async function seed() {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/fee",
  );
  console.log("Connected to MongoDB");

  // Wipe existing data for a clean reseed (remove if you want additive seeding)
  await Promise.all([
    Item.deleteMany({}),
    Category.deleteMany({}),
    Shop.deleteMany({}),
  ]);

  // ---------------------------------------------------------------------
  // 1. CATEGORIES
  // ---------------------------------------------------------------------
  const categoryDefs = [
    {
      translation: sf("Phones & Tablets", "موبایل و تبلت", "موبایل او ټابلېټ"),
      shopType: "mobile_store",
      icon: "phone-portrait",
    },
    {
      translation: sf(
        "Phone Accessories",
        "لوازم جانبی موبایل",
        "د موبایل تجهیزات",
      ),
      shopType: "mobile_store",
      icon: "headset",
    },
    {
      translation: sf("Electronics", "لوازم برقی", "بریښنایي توکي"),
      shopType: "electronics_store",
      icon: "tv",
    },
    {
      translation: sf("Cars", "موتر", "موټر"),
      shopType: "car_dealer",
      icon: "car-sport",
    },
    {
      translation: sf("Motorbikes", "موتورسیکل", "موټرسایکل"),
      shopType: "car_dealer",
      icon: "bicycle",
    },
    {
      translation: sf("Furniture", "مبلمان", "فرنیچر"),
      shopType: "furniture_store",
      icon: "bed",
    },
    {
      translation: sf(
        "Books & Stationery",
        "کتاب و لوازم‌التحریر",
        "کتابونه او د لیکلو توکي",
      ),
      shopType: "bookstore",
      icon: "book",
    },
    {
      translation: sf("Medicines", "داروها", "درملنه"),
      shopType: "pharmacy",
      icon: "medkit",
    },
  ];

  const categories = await Category.insertMany(
    categoryDefs.map((c) => ({
      translation: c.translation,
      icon: c.icon,
    })),
  );
  console.log(`Created ${categories.length} categories`);

  const categoryByName = Object.fromEntries(
    categories.map((c) => [c.translation.en.title, c]),
  );

  // First category listed per shop type becomes that shop's category.
  const categoryByType = {};
  categoryDefs.forEach((def) => {
    if (!categoryByType[def.shopType]) {
      categoryByType[def.shopType] = categoryByName[def.translation.en.title];
    }
  });

  // ---------------------------------------------------------------------
  // 2. SHOPS — reference their category
  // ---------------------------------------------------------------------
  const shopDefs = [
    {
      translation: tf(
        "Herat Mobile Store",
        "موبایل فروشی هرات",
        null,
        "Phones and accessories",
        "موبایل و لوازم جانبی",
      ),
      shopType: "mobile_store",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000001"],
      status: "confirmed",
    },
    {
      translation: tf(
        "Herat Electronics",
        "الکترونیک هرات",
        null,
        "Home electronics and appliances",
        "لوازم برقی خانگی",
      ),
      shopType: "electronics_store",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000002"],
      status: "confirmed",
    },
    {
      translation: tf(
        "Herat Car Dealer",
        "نمایشگاه موتر هرات",
        null,
        "New and used vehicles",
        "موترهای نو و کارکرده",
      ),
      shopType: "car_dealer",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000003"],
      status: "confirmed",
    },
    {
      translation: tf(
        "Herat Furniture House",
        "مبلمان هرات",
        null,
        "Home and office furniture",
        "مبلمان خانه و اداره",
      ),
      shopType: "furniture_store",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000004"],
      status: "confirmed",
    },
    {
      translation: tf(
        "Herat Bookstore",
        "کتاب فروشی هرات",
        null,
        "Books and stationery",
        "کتاب و لوازم‌التحریر",
      ),
      shopType: "bookstore",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000005"],
      status: "confirmed",
    },
    {
      translation: tf(
        "Herat Pharmacy",
        "دواخانه هرات",
        null,
        "Medicines and health products",
        "دوا و توکي روغتیایي",
      ),
      shopType: "pharmacy",
      city: "herat",
      location: heratLocation(),
      phone: ["+93700000006"],
      status: "confirmed",
    },
  ];

  const shops = await Shop.insertMany(
    shopDefs.map((shop) => ({
      translation: shop.translation,
      shopType: shop.shopType,
      city: shop.city,
      location: shop.location,
      phone: shop.phone,
      status: shop.status,
      category: categoryByType[shop.shopType]._id,
    })),
  );
  const shopByType = Object.fromEntries(
    shops.map((shop) => [shop.shopType, shop]),
  );
  console.log(`Created ${shops.length} shops`);

  // ---------------------------------------------------------------------
  // 3. ITEMS — reference both shop and category
  // ---------------------------------------------------------------------
  const itemDefs = [
    {
      categoryName: "Phones & Tablets",
      translation: tf(
        "iPhone 13, 128GB",
        "آیفون ۱۳، ۱۲۸ گیگابایت",
        null,
        "Good condition, minor scratches",
        "وضعیت خوب، خراش‌های جزئی",
      ),
      price: 480,
      attributes: [
        { key: "condition", value: "good" },
        { key: "storage", value: "128GB" },
      ],
    },
    {
      categoryName: "Cars",
      translation: tf(
        "Toyota Corolla 2015",
        "تویوتا کرولا ۲۰۱۵",
        null,
        "Well maintained, single owner",
        "خوب نگهداری شده، مالک واحد",
      ),
      price: 9500,
      attributes: [
        { key: "condition", value: "good" },
        { key: "year", value: 2015 },
      ],
    },
    {
      categoryName: "Motorbikes",
      translation: tf(
        "Honda 125, 2019",
        "هوندا ۱۲۵، ۲۰۱۹",
        null,
        "Low mileage",
        "کیلومتر پایین",
      ),
      price: 950,
      attributes: [
        { key: "condition", value: "like_new" },
        { key: "year", value: 2019 },
      ],
    },
    {
      categoryName: "Furniture",
      translation: tf(
        "Wooden Dining Table",
        "میز غذاخوری چوبی",
        null,
        "Seats 6, solid wood",
        "ظرفیت ۶ نفر، چوب یکپارچه",
      ),
      price: 220,
      attributes: [{ key: "condition", value: "good" }],
    },
    {
      categoryName: "Books & Stationery",
      translation: tf(
        "Dari Grammar Textbook",
        "کتاب دستور زبان دری",
        null,
        "Like new, no markings",
        "مثل نو، بدون یادداشت",
      ),
      price: 8,
      attributes: [{ key: "condition", value: "like_new" }],
    },
    {
      categoryName: "Medicines",
      translation: tf(
        "Vitamin C 1000mg (30 tablets)",
        "ویتامین سی ۱۰۰۰ میلی‌گرم (۳۰ عدد)",
        null,
      ),
      price: 6,
      attributes: [{ key: "expiry", value: "2027-01" }],
    },
  ];

  const items = await Item.insertMany(
    itemDefs.map((i) => {
      const category = categoryByName[i.categoryName];
      const shop =
        shopByType[
          categoryDefs.find((c) => c.translation.en.title === i.categoryName)
            .shopType
        ];
      return {
        translation: i.translation,
        price: i.price,
        attributes: i.attributes || [],
        shop: shop._id,
        category: category._id,
        city: "herat",
        location: heratLocation(),
      };
    }),
  );
  console.log(`Created ${items.length} items`);

  await mongoose.disconnect();
  console.log("Seeding complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
