import MeetingPlace from "../models/meetingPlaceModel.js";
import { catchAsync } from "../utils/catchAsync.js";

// A small, idempotent starter set keeps the picker useful before an admin UI exists.
const heratMeetingPlaces = [
  "Herat Citadel (Qala Ikhtyaruddin)",
  "Great (Friday) Mosque of Herat",
  "Musalla Complex (Minarets)",
  "Gozargah Shrine (Khwaja Abdullah Ansari)",
  "Herat University Main Gate",
  "Bagh-e Millat (Millat Park)",
  "Pol-e Malan (Old Bridge)",
  "Jihad Museum",
  "Herat Airport Road Commercial Strip",
  "Jada-ye Aria / Shahr-e Naw",
];

const HERAT_PLACES = heratMeetingPlaces.map((name) => ({ name, address: "Herat" }));

export const listMeetingPlaces = catchAsync(async (req, res) => {
  const city = String(req.query.city || "herat").trim().toLowerCase();

  if (city === "herat") {
    await MeetingPlace.bulkWrite(
      HERAT_PLACES.map((place) => ({
        updateOne: {
          filter: { city, name: place.name },
          update: { $setOnInsert: { ...place, city } },
          upsert: true,
        },
      })),
    );
  }

  const meetingPlaces = await MeetingPlace.find({
    city,
    active: true,
    ...(city === "herat" ? { name: { $in: heratMeetingPlaces } } : {}),
  })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({ status: "success", data: { meetingPlaces } });
});
