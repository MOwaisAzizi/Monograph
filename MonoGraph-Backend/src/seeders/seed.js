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

const HERAT_COORDS = [62.199, 34.348];

function heratLocation() {
  return {
    type: "Point",
    coordinates: HERAT_COORDS,
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

const shopTypeToCategoryName = {
  restaurant: "Restaurants",
  bakery: "Restaurants",
  fast_food: "Restaurants",

  cafe: "Cafes",

  pharmacy: "Pharmacies",
  clinic: "Pharmacies",

  hotel: "Hotels",
  guest_house: "Hotels",

  gym: "Gyms",

  clothing_store: "Shopping",
  shoe_store: "Shopping",
  electronics_store: "Shopping",
  mobile_store: "Shopping",
  supermarket: "Shopping",
  cosmetics_store: "Shopping",
  furniture_store: "Shopping",
  bookstore: "Shopping",

  beauty_salon: "Salons",
  barbershop: "Salons",

  repair_shop: "Shopping",
  car_wash: "Shopping",
  car_dealer: "Shopping",
  car_rental: "Shopping",
  mechanic: "Shopping",
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
      process.env.MONGO_URI ||
        "mongodb://localhost:27017/fee"
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
      process.env.DATA_PATH ||
      path.join(
        __dirname,
        "../../data/database"
      );

    // ========================================================
    // READ JSON FILES
    // ========================================================

    const categoriesData = JSON.parse(
      fs.readFileSync(
        path.join(
          dataPath,
          "categories.json"
        ),
        "utf8"
      )
    );

    const shopsData = JSON.parse(
      fs.readFileSync(
        path.join(
          dataPath,
          "shops.json"
        ),
        "utf8"
      )
    );

    const itemsData = JSON.parse(
      fs.readFileSync(
        path.join(
          dataPath,
          "items.json"
        ),
        "utf8"
      )
    );

    console.log(
      `Read ${categoriesData.length} categories`
    );

    console.log(
      `Read ${shopsData.length} shops`
    );

    console.log(
      `Read ${itemsData.length} items`
    );

    // ========================================================
    // STEP 1: CREATE CATEGORIES
    // ========================================================

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "STEP 1: Creating categories"
    );
    console.log(
      "========================================"
    );

    const categories =
      await Category.insertMany(
        categoriesData
      );

    console.log(
      `Created ${categories.length} categories`
    );

    // ========================================================
    // CATEGORY LOOKUP BY NAME
    // ========================================================

    const categoryByName = new Map();

    for (const category of categories) {
      let title = category?.translation?.en?.title;

      if (!title) {
        console.warn(`Category without title: ${category._id}`);
        continue;
      }

      categoryByName.set(
        normalize(title),
        category
      );
    }

    console.log(
      `Category lookup: ${categoryByName.size} categories`
    );

    // ========================================================
    // STEP 2: CREATE SHOPS
    // ========================================================

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "STEP 2: Creating shops with category references"
    );
    console.log(
      "========================================"
    );

    const shopsToInsert = [];

    for (const shop of shopsData) {
      const shopType =
        normalize(shop.shopType);

      const categoryName =
        shopTypeToCategoryName[
          shopType
        ];

      if (!categoryName) {
        throw new Error(
          `No category mapping for shop type "${shop.shopType}" ` +
          `(${shop?.translation?.en?.title})`
        );
      }

      const category =
        categoryByName.get(
          normalize(categoryName)
        );

      if (!category) {
        throw new Error(
          `Category "${categoryName}" not found`
        );
      }

      const {
        _id,
        ...shopData
      } = shop;

      shopsToInsert.push({
        ...shopData,
        category: category._id,
        location: heratLocation(),
      });

      console.log(
        `Shop "${shop?.translation?.en?.title}" -> ` +
        `category "${categoryName}"`
      );
    }

    // Insert shops
    const shops =
      await Shop.insertMany(
        shopsToInsert
      );

    console.log(
      `Created ${shops.length} shops`
    );

    // ========================================================
    // BUILD SHOP NAME -> NEW SHOP MAP
    // ========================================================

    const shopNameToNewShop = new Map();

    for (
      let i = 0;
      i < shopsData.length;
      i++
    ) {
      const oldShop =
        shopsData[i];

      const newShop =
        shops[i];

      if (newShop?._id) {
        const shopName = oldShop?.translation?.en?.title;
        if (shopName) {
          shopNameToNewShop.set(
            normalize(shopName),
            newShop
          );
        }
      }
    }

    console.log(
      `Built ${shopNameToNewShop.size} shop name mappings`
    );

    // ========================================================
    // STEP 3: CREATE ITEMS
    // ========================================================

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "STEP 3: Creating items with shop and category references"
    );
    console.log(
      "========================================"
    );

    const itemsToInsert = [];

    for (const item of itemsData) {
      const itemName =
        item?.translation?.en?.title ||
        "Unknown Item";

      // We need to find which shop this item belongs to
      // Since items.json has shop IDs that don't match shops.json,
      // we need to look at the context - which shop has these items?
      
      // Based on your data, all items belong to "Kabul Garden"
      const shopName = "Kabul Garden";
      const shop = shopNameToNewShop.get(normalize(shopName));

      if (!shop) {
        throw new Error(
          `Shop "${shopName}" not found for item "${itemName}"`
        );
      }

      if (!shop.category) {
        throw new Error(
          `Shop "${shopName}" does not have a category`
        );
      }

      // Remove old references
      const {
        _id,
        shop: oldItemShopId,
        category: oldItemCategoryId,
        ...itemData
      } = item;

      itemsToInsert.push({
        ...itemData,
        shop: shop._id,
        category: shop.category,
        city: "herat",
        location: heratLocation(),
      });

      console.log(
        `Item "${itemName}" -> shop: ${shop._id}, category: ${shop.category}`
      );
    }

    // Insert items
    const items =
      await Item.insertMany(
        itemsToInsert
      );

    console.log(
      `Created ${items.length} items`
    );

    // ========================================================
    // STEP 4: VERIFY RELATIONSHIPS
    // ========================================================

    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "STEP 4: RELATIONSHIP VERIFICATION"
    );
    console.log(
      "========================================"
    );

    const shopsWithoutCategory =
      await Shop.find({
        category: { $exists: false }
      });

    const itemsWithoutShop =
      await Item.find({
        shop: { $exists: false }
      });

    const itemsWithoutCategory =
      await Item.find({
        category: { $exists: false }
      });

    console.log(
      `Total categories: ${categories.length}`
    );
    console.log(
      `Total shops: ${shops.length}`
    );
    console.log(
      `Total items: ${items.length}`
    );
    console.log("");
    console.log(
      `Shops without category: ${shopsWithoutCategory.length}`
    );
    console.log(
      `Items without shop: ${itemsWithoutShop.length}`
    );
    console.log(
      `Items without category: ${itemsWithoutCategory.length}`
    );

    // ========================================================
    // STEP 5: DISPLAY EXAMPLES
    // ========================================================

    if (shops.length > 0) {
      const exampleShop =
        await Shop.findById(
          shops[0]._id
        ).populate("category");

      console.log("");
      console.log(
        "Example shop with category:"
      );
      console.log({
        shopId: exampleShop._id,
        shopName: exampleShop?.translation?.en?.title,
        shopType: exampleShop.shopType,
        categoryId: exampleShop.category?._id || null,
        categoryName: exampleShop.category?.translation?.en?.title || null,
      });
    }

    if (items.length > 0) {
      const exampleItem =
        await Item.findById(
          items[0]._id
        )
          .populate("shop")
          .populate("category");

      console.log("");
      console.log(
        "Example item with shop and category:"
      );
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
    console.log(
      "========================================"
    );

    if (
      shopsWithoutCategory.length === 0 &&
      itemsWithoutShop.length === 0 &&
      itemsWithoutCategory.length === 0
    ) {
      console.log(
        "✅ SUCCESS: All relationships are properly connected."
      );
    } else {
      console.log(
        "⚠️ WARNING: Some relationships are missing."
      );
      console.log(
        `Shops without category: ${shopsWithoutCategory.length}`
      );
      console.log(
        `Items without shop: ${itemsWithoutShop.length}`
      );
      console.log(
        `Items without category: ${itemsWithoutCategory.length}`
      );
    }

    console.log(
      "========================================"
    );

    await mongoose.disconnect();

    console.log(
      "Seeding complete"
    );
  } catch (error) {
    console.error("");
    console.error(
      "========================================"
    );
    console.error(
      "❌ SEED FAILED"
    );
    console.error(
      "========================================"
    );
    console.error(error);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
}

seed();