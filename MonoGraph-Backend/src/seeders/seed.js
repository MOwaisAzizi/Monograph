import mongoose from 'mongoose';
import Business from '../models/businessModel.js';
import Category from '../models/categoryModel.js';
import Item from '../models/itemModel.js';

/**
 * SCHEMA NOTES — confirmed / still-assumed shapes:
 *
 * 1. translationSchema.js
 *    - `multipleFields` (used by Business, Item) — CONFIRMED by the validation
 *      error: keyed by language, each language requires `title`.
 *        { en: { title, description? }, fa: {...}, ps: {...} }
 *    - `singleField` (used by Category) — still ASSUMED flat per-language
 *      string, since Category was never reached before Business failed:
 *        { en: String, fa: String, ps: String }
 *      If Category insertion throws a similar "field required" error,
 *      singleField probably also nests like multipleFields — tell me the
 *      exact error and I'll fix it in one pass.
 *
 * 2. locationSchema.js
 *    - `address` is an embedded subdocument, NOT a string (confirmed by the
 *      cast error). Shape unknown, so `address` is OMITTED below entirely
 *      until you share locationSchema.js. Everything else (type/coordinates)
 *      is included since that part didn't error.
 *    - Coordinate order assumed [lng, lat] (GeoJSON standard) — CONFIRM,
 *      since this project has hit ordering bugs before.
 *
 * 3. mediaSchema.js — assumed { url: String, type: 'image' | 'video' }.
 *    Not used in this seed yet (media: [] left empty) since no image URLs
 *    were provided. Add real URLs once you have them.
 *
 * 4. workingHoursModel.js — assumed { day, open, close }. Not populated
 *    below (left as []) — add once confirmed, since guessing wrongly here
 *    is low-stakes (optional array) but I'd rather not fabricate hours.
 *
 * Once you paste translationSchema.js and locationSchema.js I'll lock these
 * in exactly — the seeding ORDER (business -> category -> item) is correct
 * regardless of these shape tweaks.
 */

const HERAT_COORDS = [62.199, 34.348]; // [lng, lat] — CONFIRM against locationSchema

function heratLocation() {
  return { type: 'Point', coordinates: HERAT_COORDS };
}

/** multipleFields: nested { title, description } per language. */
function tf(titleEn, titleFa, titlePs, descEn, descFa, descPs) {
  return {
    en: { title: titleEn, description: descEn },
    fa: { title: titleFa, description: descFa },
    ps: { title: titlePs || titleEn, description: descPs || descEn },
  };
}

/** singleField: flat string per language (ASSUMED — see notes above). */
/** Category translation: nested { title } per language. */
function sf(titleEn, titleFa, titlePs) {
  return {
    en: { title: titleEn },
    fa: { title: titleFa },
    ps: { title: titlePs || titleEn },
  };
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fee');
  console.log('Connected to MongoDB');

  // Wipe existing data for a clean reseed (remove if you want additive seeding)
  await Promise.all([
    Item.deleteMany({}),
     Category.deleteMany({}),
     Business.deleteMany({})
    ]);

  // ---------------------------------------------------------------------
  // 1. BUSINESSES — must exist first, since Category.business is required
  // ---------------------------------------------------------------------
  const businessDefs = [
    {
      translation: tf('Herat Mobile Store', 'موبایل فروشی هرات', null, 'Phones and accessories', 'موبایل و لوازم جانبی'),
      businessType: 'mobile_store',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000001'],
      status: 'confirmed',
    },
    {
      translation: tf('Herat Electronics', 'الکترونیک هرات', null, 'Home electronics and appliances', 'لوازم برقی خانگی'),
      businessType: 'electronics_store',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000002'],
      status: 'confirmed',
    },
    {
      translation: tf('Herat Car Dealer', 'نمایشگاه موتر هرات', null, 'New and used vehicles', 'موترهای نو و کارکرده'),
      businessType: 'car_dealer',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000003'],
      status: 'confirmed',
    },
    {
      translation: tf('Herat Furniture House', 'مبلمان هرات', null, 'Home and office furniture', 'مبلمان خانه و اداره'),
      businessType: 'furniture_store',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000004'],
      status: 'confirmed',
    },
    {
      translation: tf('Herat Bookstore', 'کتاب فروشی هرات', null, 'Books and stationery', 'کتاب و لوازم‌التحریر'),
      businessType: 'bookstore',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000005'],
      status: 'confirmed',
    },
    {
      translation: tf('Herat Pharmacy', 'دواخانه هرات', null, 'Medicines and health products', 'دوا و توکي روغتیایي'),
      businessType: 'pharmacy',
      city: 'herat',
      location: heratLocation(),
      phone: ['+93700000006'],
      status: 'confirmed',
    },
  ];

  const businesses = await Business.insertMany(businessDefs);
  const businessByType = Object.fromEntries(businesses.map((b) => [b.businessType, b]));
  console.log(`Created ${businesses.length} businesses`);

  // ---------------------------------------------------------------------
  // 2. CATEGORIES — each tied to the business it belongs to
  // ---------------------------------------------------------------------
 const categoryDefs = [
  {
    translation: sf('Phones & Tablets', 'موبایل و تبلت', 'موبایل او ټابلېټ'),
    businessType: 'mobile_store',
    icon: 'phone-portrait',
  },
  {
    translation: sf('Phone Accessories', 'لوازم جانبی موبایل', 'د موبایل تجهیزات'),
    businessType: 'mobile_store',
    icon: 'headset',
  },
  {
    translation: sf('Electronics', 'لوازم برقی', 'بریښنایي توکي'),
    businessType: 'electronics_store',
    icon: 'tv',
  },
  {
    translation: sf('Cars', 'موتر', 'موټر'),
    businessType: 'car_dealer',
    icon: 'car-sport',
  },
  {
    translation: sf('Motorbikes', 'موتورسیکل', 'موټرسایکل'),
    businessType: 'car_dealer',
    icon: 'bicycle',
  },
  {
    translation: sf('Furniture', 'مبلمان', 'فرنیچر'),
    businessType: 'furniture_store',
    icon: 'bed',
  },
  {
    translation: sf('Books & Stationery', 'کتاب و لوازم‌التحریر', 'کتابونه او د لیکلو توکي'),
    businessType: 'bookstore',
    icon: 'book',
  },
  {
    translation: sf('Medicines', 'داروها', 'درملنه'),
    businessType: 'pharmacy',
    icon: 'medkit',
  },
];

  const categories = await Category.insertMany(
  categoryDefs.map((c) => ({
    translation: c.translation,
    icon: c.icon,
    business: businessByType[c.businessType]._id,
  })),
);
  console.log(`Created ${categories.length} categories`);

const categoryByName = Object.fromEntries(
  categories.map((c) => [c.translation.en.title, c]),
);
  // ---------------------------------------------------------------------
  // 3. ITEMS — reference both business and category
  // ---------------------------------------------------------------------
  const itemDefs = [
    {
      categoryName: 'Phones & Tablets',
      translation: tf('iPhone 13, 128GB', 'آیفون ۱۳، ۱۲۸ گیگابایت', null, 'Good condition, minor scratches', 'وضعیت خوب، خراش‌های جزئی'),
      price: 480,
      attributes: [{ key: 'condition', value: 'good' }, { key: 'storage', value: '128GB' }],
    },
    {
      categoryName: 'Cars',
      translation: tf('Toyota Corolla 2015', 'تویوتا کرولا ۲۰۱۵', null, 'Well maintained, single owner', 'خوب نگهداری شده، مالک واحد'),
      price: 9500,
      attributes: [{ key: 'condition', value: 'good' }, { key: 'year', value: 2015 }],
    },
    {
      categoryName: 'Motorbikes',
      translation: tf('Honda 125, 2019', 'هوندا ۱۲۵، ۲۰۱۹', null, 'Low mileage', 'کیلومتر پایین'),
      price: 950,
      attributes: [{ key: 'condition', value: 'like_new' }, { key: 'year', value: 2019 }],
    },
    {
      categoryName: 'Furniture',
      translation: tf('Wooden Dining Table', 'میز غذاخوری چوبی', null, 'Seats 6, solid wood', 'ظرفیت ۶ نفر، چوب یکپارچه'),
      price: 220,
      attributes: [{ key: 'condition', value: 'good' }],
    },
    {
      categoryName: 'Books & Stationery',
      translation: tf('Dari Grammar Textbook', 'کتاب دستور زبان دری', null, 'Like new, no markings', 'مثل نو، بدون یادداشت'),
      price: 8,
      attributes: [{ key: 'condition', value: 'like_new' }],
    },
    {
      categoryName: 'Medicines',
      translation: tf('Vitamin C 1000mg (30 tablets)', 'ویتامین سی ۱۰۰۰ میلی‌گرم (۳۰ عدد)', null),
      price: 6,
      attributes: [{ key: 'expiry', value: '2027-01' }],
    },
  ];

  const items = await Item.insertMany(
    itemDefs.map((i) => {
      const category = categoryByName[i.categoryName];
      return {
        translation: i.translation,
        price: i.price,
        attributes: i.attributes || [],
        business: category.business,
        category: category._id,
        city: 'herat',
        location: heratLocation(),
      };
    }),
  );
  console.log(`Created ${items.length} items`);

  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});