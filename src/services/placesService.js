const axios = require("axios");
const { searchGeoapify } = require("./geoapifyService");
const { searchWikidata } = require("./wikidataService");

// ─────────────────────────────────────────────
// Overpass Search
// ─────────────────────────────────────────────
const searchOverpass = async (latitude, longitude, radiusMeters) => {
  const query = `
    [out:json][timeout:25];

    (
      node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});
      node["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});
      node["healthcare"="clinic"](around:${radiusMeters},${latitude},${longitude});

      way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      way["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});
    );

    out center tags;
  `;

  const response = await axios.get(
    "https://overpass-api.de/api/interpreter",
    {
      params: { data: query },
      headers: {
        "User-Agent": "HealthSage/1.0 (student project)",
        Accept: "application/json",
      },
    }
  );

  return response.data.elements.map((el) => {
    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;

    return {
      name: el.tags?.name || "Unnamed Hospital",
      address:
        el.tags?.["addr:full"] ||
        el.tags?.["addr:housenumber"] && el.tags?.["addr:street"]
          ? `${el.tags?.["addr:housenumber"] || ""} ${
              el.tags?.["addr:street"] || ""
            }`.trim()
          : el.tags?.["addr:street"] ||
            el.tags?.["addr:city"] ||
            "Address not available",

      lat,
      lon,
      source: "overpass",
    };
  });
};

// ─────────────────────────────────────────────
// Distance Calculator
// ─────────────────────────────────────────────
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─────────────────────────────────────────────
// Normalize Hospital Name
// ─────────────────────────────────────────────
const normalizeName = (name = "") => {
  return name
    .toLowerCase()
    .replace(
      /\b(old campus|new campus|building|block|opd|department|unit|wing)\b/gi,
      ""
    )
    .replace(/\bmedical college\b/gi, "medical college")
    .replace(/\bhospital\b/gi, "hospital")
    .replace(/[^a-z0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ─────────────────────────────────────────────
// Google Maps Link
// ─────────────────────────────────────────────
const createMapsLink = (name, latitude, longitude) => {
  if (!latitude || !longitude) return null;

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};

// ─────────────────────────────────────────────
// Search All Sources
// ─────────────────────────────────────────────
const searchAllSources = async (
  latitude,
  longitude,
  radiusMeters
) => {
  const radiusKm = radiusMeters / 1000;

  const results = await Promise.allSettled([
    searchOverpass(latitude, longitude, radiusMeters),
    searchGeoapify(latitude, longitude, radiusMeters),
    searchWikidata(latitude, longitude, radiusKm),
  ]);

  const allPlaces = results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value || [])
    .filter(
      (place) =>
        place &&
        place.name &&
        Number.isFinite(Number(place.lat)) &&
        Number.isFinite(Number(place.lon))
    );

  // ─────────────────────────────────────────
  // Deduplicate
  // ─────────────────────────────────────────

  const uniquePlaces = [];

  for (const place of allPlaces) {
    const normalized = normalizeName(place.name);

    // Check if a similar hospital already exists
    const duplicate = uniquePlaces.find((existing) => {
      const existingName = normalizeName(existing.name);

      return (
        existingName === normalized ||
        existingName.includes(normalized) ||
        normalized.includes(existingName)
      );
    });

    if (duplicate) {
      // Prefer an address that is available
      if (
        (!duplicate.address ||
          duplicate.address === "Address not available") &&
        place.address &&
        place.address !== "Address not available"
      ) {
        duplicate.address = place.address;
      }

      // Prefer Geoapify/Wikidata if coordinates are available
      if (
        duplicate.source === "overpass" &&
        place.source !== "overpass"
      ) {
        duplicate.lat = place.lat;
        duplicate.lon = place.lon;
        duplicate.source = place.source;
      }

      continue;
    }

    uniquePlaces.push({
      name: place.name,
      address: place.address || "Address not available",
      lat: Number(place.lat),
      lon: Number(place.lon),
      source: place.source || "unknown",
    });
  }

  // ─────────────────────────────────────────
  // Add Distance + Maps Link
  // ─────────────────────────────────────────

  const enrichedPlaces = uniquePlaces.map((place) => {
    const distance = distanceKm(
      latitude,
      longitude,
      place.lat,
      place.lon
    );

    return {
      ...place,
      distanceKm: Number(distance.toFixed(2)),
      mapsUrl: createMapsLink(
        place.name,
        place.lat,
        place.lon
      ),
    };
  });

  // ─────────────────────────────────────────
  // Sort nearest first
  // ─────────────────────────────────────────

  enrichedPlaces.sort(
    (a, b) => a.distanceKm - b.distanceKm
  );

  return enrichedPlaces;
};

// ─────────────────────────────────────────────
// Main Function
// ─────────────────────────────────────────────
const findNearbyHospitals = async (
  latitude,
  longitude
) => {
  const radiiToTry = [
    5000,
    15000,
    30000,
    60000,
    100000,
  ];

  for (const radius of radiiToTry) {
    try {
      const places = await searchAllSources(
        latitude,
        longitude,
        radius
      );

      if (places.length > 0) {
        return {
          places: places.slice(0, 10),
          searchRadiusKm: radius / 1000,
        };
      }
    } catch (error) {
      console.error(
        `Hospital search failed for ${radius / 1000}km:`,
        error.message
      );
    }
  }

  return {
    places: [],
    searchRadiusKm: 100,
  };
};

module.exports = {
  findNearbyHospitals,
};