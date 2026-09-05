import MeetingPlace from "../models/meetingPlaceModel.js";
import { catchAsync } from "../utils/catchAsync.js";

const heratMeetingPlaces = [
  {
    en: "Herat Citadel (Qala Ikhtyaruddin)",
    fa: "قلعه اختیارالدین هرات",
    ps: "د هرات اختیارالدین کلا",
  },
  {
    en: "Great (Friday) Mosque of Herat",
    fa: "مسجد جامع هرات",
    ps: "د هرات جامع جومات",
  },
  {
    en: "Musalla Complex (Minarets)",
    fa: "مجموعه مصلی هرات (منارها)",
    ps: "د هرات مصلی مجموعه (منارونه)",
  },
  {
    en: "Gozargah Shrine (Khwaja Abdullah Ansari)",
    fa: "زیارتگاه گازرگاه (خواجه عبدالله انصاری)",
    ps: "د ګازرګاه زیارت (خواجه عبدالله انصاري)",
  },
  {
    en: "Herat University Main Gate",
    fa: "دروازه اصلی دانشگاه هرات",
    ps: "د هرات پوهنتون اصلي دروازه",
  },
  {
    en: "Bagh-e Millat (Millat Park)",
    fa: "باغ ملت",
    ps: "ملت باغ",
  },
  {
    en: "Pol-e Malan (Old Bridge)",
    fa: "پل مالان (پل قدیمی)",
    ps: "د مالان پل (زوړ پل)",
  },
  {
    en: "Jihad Museum",
    fa: "موزه جهاد",
    ps: "د جهاد موزیم",
  },
  {
    en: "Herat Airport Road Commercial Strip",
    fa: "منطقه تجارتی جاده میدان هوایی هرات",
    ps: "د هرات هوايي ډګر سړک سوداګریزه سیمه",
  },
  {
    en: "Jada-ye Aria / Shahr-e Naw",
    fa: "جاده آریا / شهر نو",
    ps: "د آریا سړک / شهر نو",
  },
];

const HERAT_PLACES = heratMeetingPlaces.map((address) => ({
  city: "herat",

  location: {
    address: {
      en: { title: address.en },
      fa: { title: address.fa },
      ps: { title: address.ps },
    },
    geoPosition: {
      type: "Point",
      coordinates: [0, 0],
    },
  },
}));

export const listMeetingPlaces = catchAsync(async (req, res) => {
  const city = String(req.query.city || "herat")
    .trim()
    .toLowerCase();

  // Seed Herat meeting places if they don't already exist
  if (city === "herat") {
    await MeetingPlace.bulkWrite(
      HERAT_PLACES.map((place) => ({
        updateOne: {
          filter: {
            city,
            "location.address.en": place.location.address.en,
          },

          update: {
            $setOnInsert: place,
          },

          upsert: true,
        },
      })),
    );
  }

  const meetingPlaces = await MeetingPlace.find({
    city,
    active: true,
  })
    .sort({ "location.address.en": 1 })
    .lean();

  res.status(200).json({
    status: "success",
    data: {
      meetingPlaces,
    },
  });
});