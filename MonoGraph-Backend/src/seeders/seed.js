import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Shop from "../models/shopModel.js";
import Category from "../models/categoryModel.js";
import Item from "../models/itemModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIG
// ============================================================

const HERAT_COORDS = [62.199, 34.348]; // [lng, lat] fallback

// locationSchema's `address` uses `singleField` (same shape as Category's
// `translation`), i.e. { en: { title }, fa: { title }, ps: { title } }.
// shops.json stores address as a plain string per language, so wrap it here.
function toSingleFieldAddress(rawAddress) {
  if (!rawAddress) return undefined;

  const address = {};

  for (const lang of ["en", "fa", "ps"]) {
    if (rawAddress[lang]) {
      address[lang] = { title: rawAddress[lang] };
    }
  }

  return address;
}

// locationSchema expects: { address, geoPosition: { type: "Point", coordinates: [lng, lat] } }
// Build this from each shop's own lat/lng in shops.json instead of a single
// hardcoded point for everyone, and keep the address instead of discarding it.
function toLocation(rawLocation) {
  const lat = rawLocation?.coordinates?.lat ?? HERAT_COORDS[1];
  const lng = rawLocation?.coordinates?.lng ?? HERAT_COORDS[0];

  return {
    address: toSingleFieldAddress(rawLocation?.address),
    geoPosition: {
      type: "Point",
      coordinates: [lng, lat],
    },
  };
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ============================================================
// SHOP TYPE -> CATEGORY
// ============================================================
// Only 6 categories now: Furniture, Bikes, Phones, Cars, Electronics, TVs

const shopTypeToCategoryName = {
  furniture_store: "Furniture",
  bike_store: "Bikes",
  phone_store: "Phones",
  car_dealer: "Cars",
  electronics_store: "Electronics",
  tv_store: "TVs",
  carpet_store: "Carpets",
  computer_store: "Computers",
};

// ============================================================
// SEED
// ============================================================

async function seed() {
  try {
    // ========================================================
    // CONNECT
    // ========================================================

    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/fee",
    );

    console.log("Connected to MongoDB");

    // ========================================================
    // DELETE OLD DATA
    // ========================================================

    await Item.deleteMany({});
    await Shop.deleteMany({});
    await Category.deleteMany({});

    console.log("Existing data deleted");

    // ========================================================
    // DATA PATH
    // ========================================================

    const dataPath =
      process.env.DATA_PATH || path.join(__dirname, "../../data/database");

    // ========================================================
    // READ JSON FILES
    // ========================================================

    const categoriesData = JSON.parse(
      fs.readFileSync(path.join(dataPath, "categories.json"), "utf8"),
    );

    const shopsData = JSON.parse(
      fs.readFileSync(path.join(dataPath, "shops.json"), "utf8"),
    );

    const itemsData = JSON.parse(
      fs.readFileSync(path.join(dataPath, "items.json"), "utf8"),
    );

    console.log(`Read ${categoriesData.length} categories`);
    console.log(`Read ${shopsData.length} shops`);
    console.log(`Read ${itemsData.length} items`);

    // ========================================================
    // STEP 1: CREATE CATEGORIES
    // ========================================================

    console.log("");
    console.log("========================================");
    console.log("STEP 1: Creating categories");
    console.log("========================================");

    const categories = await Category.insertMany(categoriesData);

    console.log(`Created ${categories.length} categories`);

    // ========================================================
    // CATEGORY LOOKUP BY NAME
    // ========================================================

    const categoryByName = new Map();

    for (const category of categories) {
      const title = category?.translation?.en?.title;

      if (!title) {
        console.warn(`Category without title: ${category._id}`);
        continue;
      }

      categoryByName.set(normalize(title), category);
    }

    console.log(`Category lookup: ${categoryByName.size} categories`);

    // ========================================================
    // STEP 2: CREATE SHOPS (with real category ObjectIds)
    // ========================================================

    console.log("");
    console.log("========================================");
    console.log("STEP 2: Creating shops with category references");
    console.log("========================================");

    const shopsToInsert = [];

    for (const shop of shopsData) {
      const shopType = normalize(shop.shopType);

      const categoryName = shopTypeToCategoryName[shopType];

      if (!categoryName) {
        throw new Error(
          `No category mapping for shop type "${shop.shopType}" ` +
            `(${shop?.translation?.en?.title})`,
        );
      }

      const category = categoryByName.get(normalize(categoryName));

      if (!category) {
        throw new Error(`Category "${categoryName}" not found`);
      }

      const { _id, location: rawLocation, ...shopData } = shop;

      shopsToInsert.push({
        ...shopData,
        category: category._id,
        location: toLocation(rawLocation),
      });

      console.log(
        `Shop "${shop?.translation?.en?.title}" -> ` +
          `category "${categoryName}"`,
      );
    }

    // Insert shops (Mongo assigns real ObjectIds here)
    const shops = await Shop.insertMany(shopsToInsert);

    console.log(`Created ${shops.length} shops`);

    // ========================================================
    // BUILD SHOP TITLE -> NEW SHOP MAP
    // ========================================================
    // shopsToInsert and shops are in the same order as shopsData,
    // so we can zip them by index to recover each shop's English title.

    const shopByTitle = new Map();

    for (let i = 0; i < shopsData.length; i++) {
      const oldShop = shopsData[i];
      const newShop = shops[i];

      const shopTitle = oldShop?.translation?.en?.title;

      if (newShop?._id && shopTitle) {
        shopByTitle.set(normalize(shopTitle), newShop);
      }
    }

    console.log(`Built ${shopByTitle.size} shop title mappings`);

    // ========================================================
    // STEP 3: CREATE ITEMS (with real shop + category ObjectIds)
    // ========================================================
    // Every item in items.json carries a "shopTitle" field that names
    // the exact shop (by English title) it belongs to. This lets us
    // look up the freshly-created shop's real _id and category _id
    // instead of guessing/hardcoding a single shop for everything.

    console.log("");
    console.log("========================================");
    console.log("STEP 3: Creating items with shop and category references");
    console.log("========================================");

    const itemsToInsert = [];

    for (const item of itemsData) {
      const itemName = item?.translation?.en?.title || "Unknown Item";

      const shopTitle = item.shopTitle;

      if (!shopTitle) {
        throw new Error(`Item "${itemName}" is missing a "shopTitle" field`);
      }

      const shop = shopByTitle.get(normalize(shopTitle));

      if (!shop) {
        throw new Error(
          `Shop "${shopTitle}" not found for item "${itemName}"`,
        );
      }

      if (!shop.category) {
        throw new Error(`Shop "${shopTitle}" does not have a category`);
      }

      // Remove seed-only / old references before inserting
      const { _id, shop: _oldShop, category: _oldCategory, shopTitle: _st, ...itemData } = item;

      itemsToInsert.push({
        ...itemData,
        shop: shop._id,
        category: shop.category,
        city: "herat",
        // Items don't carry their own address in items.json, so they
        // inherit their shop's already-validated location.
        location: shop.location,
      });

      console.log(
        `Item "${itemName}" -> shop: ${shop._id}, category: ${shop.category}`,
      );
    }

    // Insert items
    const items = await Item.insertMany(itemsToInsert);

    console.log(`Created ${items.length} items`);

    // ========================================================
    // STEP 4: VERIFY RELATIONSHIPS
    // ========================================================

    console.log("");
    console.log("========================================");
    console.log("STEP 4: RELATIONSHIP VERIFICATION");
    console.log("========================================");

    const shopsWithoutCategory = await Shop.find({
      category: { $exists: false },
    });

    const itemsWithoutShop = await Item.find({
      shop: { $exists: false },
    });

    const itemsWithoutCategory = await Item.find({
      category: { $exists: false },
    });

    console.log(`Total categories: ${categories.length}`);
    console.log(`Total shops: ${shops.length}`);
    console.log(`Total items: ${items.length}`);
    console.log("");
    console.log(`Shops without category: ${shopsWithoutCategory.length}`);
    console.log(`Items without shop: ${itemsWithoutShop.length}`);
    console.log(`Items without category: ${itemsWithoutCategory.length}`);

    // ========================================================
    // STEP 4b: PER-CATEGORY COUNTS (each should have >= 4 shops/items)
    // ========================================================

    console.log("");
    console.log("Per-category counts:");

    for (const category of categories) {
      const categoryTitle = category?.translation?.en?.title;

      const shopCount = await Shop.countDocuments({ category: category._id });
      const itemCount = await Item.countDocuments({ category: category._id });

      console.log(
        `  ${categoryTitle}: ${shopCount} shops, ${itemCount} items`,
      );
    }

    // ========================================================
    // STEP 5: DISPLAY EXAMPLES
    // ========================================================

    if (shops.length > 0) {
      const exampleShop = await Shop.findById(shops[0]._id).populate(
        "category",
      );

      console.log("");
      console.log("Example shop with category:");
      console.log({
        shopId: exampleShop._id,
        shopName: exampleShop?.translation?.en?.title,
        shopType: exampleShop.shopType,
        categoryId: exampleShop.category?._id || null,
        categoryName: exampleShop.category?.translation?.en?.title || null,
      });
    }

    if (items.length > 0) {
      const exampleItem = await Item.findById(items[0]._id)
        .populate("shop")
        .populate("category");

      console.log("");
      console.log("Example item with shop and category:");
      console.log({
        itemId: exampleItem._id,
        itemName: exampleItem?.translation?.en?.title,
        shopId: exampleItem.shop?._id || null,
        shopName: exampleItem.shop?.translation?.en?.title || null,
        categoryId: exampleItem.category?._id || null,
        categoryName: exampleItem.category?.translation?.en?.title || null,
      });
    }

    // ========================================================
    // FINAL RESULT
    // ========================================================

    console.log("");
    console.log("========================================");

    if (
      shopsWithoutCategory.length === 0 &&
      itemsWithoutShop.length === 0 &&
      itemsWithoutCategory.length === 0
    ) {
      console.log("✅ SUCCESS: All relationships are properly connected.");
    } else {
      console.log("⚠️ WARNING: Some relationships are missing.");
      console.log(`Shops without category: ${shopsWithoutCategory.length}`);
      console.log(`Items without shop: ${itemsWithoutShop.length}`);
      console.log(`Items without category: ${itemsWithoutCategory.length}`);
    }

    console.log("========================================");

    await mongoose.disconnect();

    console.log("Seeding complete");
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ SEED FAILED");
    console.error("========================================");
    console.error(error);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
}

seed();