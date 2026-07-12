import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // needed for ESM __dirname
import Business from "../models/businessModel.js";
import Category from "../models/categoryModel.js";
import Item from "../models/itemModel.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB local
const DB = 'mongodb://127.0.0.1:27017/fee';

// Correct path relative to this script file
const dataPath = path.join(__dirname, '../../data/database/');

const fileModelMap = {
  // 'businesses.json': Business,
  'items.json': Item,
  // 'categories.json': Category,
};

// Convert MongoDB Extended JSON to proper types
const fixMongoExtendedJSON = obj => {
  if (Array.isArray(obj)) {
    return obj.map(fixMongoExtendedJSON);
  } else if (obj && typeof obj === 'object') {
    // Handle ObjectId
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    // Handle Date
    if (obj.$date) {
      return new Date(obj.$date);
    }
    const fixed = {};
    for (const key in obj) {
      fixed[key] = fixMongoExtendedJSON(obj[key]);
    }
    return fixed;
  } else {
    return obj;
  }
};

const importData = async () => {
  try {
    await mongoose.connect(DB);
    console.log('Database connected! 🎉🎉🎉');

    // for (const model of Object.values(fileModelMap)) {
    //   await model.deleteMany();
    // }

    for (const [file, model] of Object.entries(fileModelMap)) {
      const filePath = path.join(dataPath, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${file}`);
        continue;
      }

      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const data = fixMongoExtendedJSON(rawData);

      if (data.length === 0) continue;
      await model.insertMany(data);
    }

    console.log('Local database filled with data successfully ✅');
    process.exit();
  } catch (err) {
    console.error(err.stack);
    process.exit(1);
  }
};

importData();
