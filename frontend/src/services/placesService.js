const axios = require("axios");
const { searchGeoapify } = require("./geoapifyService");
const { searchWikidata } = require("./wikidataService");

const searchOverpass = async (latitude, longitude, radiusMeters) => {
  const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});node["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});node["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});node["healthcare"="clinic"](around:${radiusMeters},${latitude},${longitude});way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude}););out center 15;`;

  const response = await axios.get("https://overpass-api.de/api/interpreter", {
    params: { data: query },
    headers: {
      "User-Agent": "HealthSage/1.0 (student project)",
      "Accept": "application/json",
    },
  });

  return response.data.elements.map((el) => ({
    name: el.tags?.name || "Unnamed Facility",
    address: el.tags?.["addr:full"] || el.tags?.["addr:street"] || "Address not available",
    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon,
    source: "overpass",
  }));
};

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const searchAllSources = async (latitude, longitude, radiusMeters) => {
  const radiusKm = radiusMeters / 1000;

  const results = await Promise.allSettled([
    searchOverpass(latitude, longitude, radiusMeters),
    searchGeoapify(latitude, longitude, radiusMeters),
    searchWikidata(latitude, longitude, radiusKm),
  ]);

  const allPlaces = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .filter((p) => p.lat && p.lon);

  // deduplicate by normalized name, keep first occurrence (overpass > geoapify > wikidata priority)
  const seenNames = new Set();
  const deduped = allPlaces.filter((p) => {
    const key = p.name.toLowerCase().trim().replace(/\s+/g, " ");
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  // sort by distance
  deduped.sort((a, b) => {
    const distA = distanceKm(latitude, longitude, a.lat, a.lon);
    const distB = distanceKm(latitude, longitude, b.lat, b.lon);
    return distA - distB;
  });

  return deduped;
};

const findNearbyHospitals = async (latitude, longitude) => {
  const radiiToTry = [5000, 15000, 30000, 60000, 100000];

  for (const radius of radiiToTry) {
    const places = await searchAllSources(latitude, longitude, radius);
    if (places.length > 0) {
      return { places: places.slice(0, 10), searchRadiusKm: radius / 1000 };
    }
  }

  return { places: [], searchRadiusKm: radiiToTry[radiiToTry.length - 1] / 1000 };
};

module.exports = { findNearbyHospitals };