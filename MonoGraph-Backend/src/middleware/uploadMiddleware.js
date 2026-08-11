import fs from "fs/promises";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import AppError from "../utils/AppError.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isImage =
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/octet-stream";
    if (isImage) {
      cb(null, true);
      return;
    }

    cb(new AppError("Only image files are allowed", 400), false);
  },
});

const parseJsonField = (value, fallback = value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getSafeBaseName = (req, category) => {
  const translation = parseJsonField(req.body?.translation, {});
  const title =
    translation?.en?.title || translation?.fa?.title || translation?.ps?.title;
  return title ? `${title}`.trim().replace(/\s+/g, "-") : category;
};

const storeMediaFile = async (file, category, fieldName, req) => {
  const uploadRoot = path.join(process.cwd(), "data", "images", category);
  await fs.mkdir(uploadRoot, { recursive: true });

  const baseName = getSafeBaseName(req, category);
  const uniqueSuffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const fileStem = `${baseName}-${uniqueSuffix}`;
  const resizedName = `${fileStem}.webp`;
  const outputPath = path.join(uploadRoot, resizedName);
  const publicBase = `${process.env.BASE_URL || "http://localhost:8000"}/images/${category}`;

  await sharp(file.buffer)
    .resize({
      width: 256,
      height: 256,
      fit: "cover",
      position: "center",
    })
    .toFormat("webp")
    .toFile(outputPath);

  return {
    type:
      fieldName === "cover"
        ? "cover"
        : fieldName === "profile"
          ? "profile"
          : "gallery",
    url: `${publicBase}/${resizedName}`,
  };
};

const normalizeFormBody = (body = {}) => {
  const nextBody = { ...body };

  for (const field of [
    "translation",
    "location",
    "phone",
    "workingHours",
    "social",
    "attributes",
    "media",
  ]) {
    if (field in nextBody && typeof nextBody[field] === "string") {
      nextBody[field] = parseJsonField(nextBody[field], nextBody[field]);
    }
  }

  if (
    "legacyMediaUrls" in nextBody &&
    typeof nextBody.legacyMediaUrls === "string"
  ) {
    nextBody.legacyMediaUrls = parseJsonField(nextBody.legacyMediaUrls, [
      nextBody.legacyMediaUrls,
    ]);
  }

  return nextBody;
};

export const uploadMediaFiles = (category, fieldMap = { media: 6 }) => {
  const fieldNames = Object.entries(fieldMap).map(([name, maxCount]) => ({
    name,
    maxCount,
  }));

  return (req, res, next) => {
    upload.fields(fieldNames)(req, res, async (err) => {
      try {

        if (err) {
          return next(new AppError(err.message, 400));
        }
        req.body = normalizeFormBody(req.body);
       
        const filesByField = req.files || {};
        if (!filesByField || Object.keys(filesByField).length === 0) {
          return next();
        }

        const mediaEntries = [];
        for (const [fieldName, fieldFiles] of Object.entries(filesByField)) {
          for (const [index, file] of (fieldFiles || []).entries()) {
            const entry = await storeMediaFile(file, category, fieldName, req);
            mediaEntries.push(entry);
          }
        }

        if (mediaEntries.length > 0) {
          const legacyMedia = Array.isArray(req.body.media)
            ? req.body.media
            : [];
          if (category === "user") {
            req.body.media = mediaEntries[0];
          } else {
            req.body.media = [...mediaEntries, ...legacyMedia];
          }
        }

        return next();
      } catch (error) {
        return next(new AppError(error.message || "Image upload failed", 400));
      }
    });
  };
};
