const axios = require("axios");
const { searchGeoapify } = require("./geoapifyService");
const { searchWikidata } = require("./wikidataService");

const searchOverpass = async (
  latitude,
  longitude,
  radiusMeters
) => {
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
      params: {
        data: query,
      },
      headers: {
        Accept: "application/json",
      },
    }
  );

  return (response.data.elements || []).map((el) => ({
    name: el.tags?.name || "Unnamed Facility",
    address:
      el.tags?.["addr:full"] ||
      el.tags?.["addr:street"] ||
      el.tags?.["addr:city"] ||
      "Address not available",

    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon,
    source: "overpass",
  }));
};


const distanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
};


const searchAllSources = async (
  latitude,
  longitude,
  radiusMeters
) => {
  const radiusKm =
    radiusMeters / 1000;

  const results =
    await Promise.allSettled([
      searchOverpass(
        latitude,
        longitude,
        radiusMeters
      ),

      searchGeoapify(
        latitude,
        longitude,
        radiusMeters
      ),

      searchWikidata(
        latitude,
        longitude,
        radiusKm
      ),
    ]);


  const allPlaces = results
    .filter(
      (result) =>
        result.status === "fulfilled"
    )
    .flatMap(
      (result) =>
        result.value || []
    )
    .filter(
      (place) =>
        place &&
        place.name &&
        Number.isFinite(
          Number(place.lat)
        ) &&
        Number.isFinite(
          Number(place.lon)
        )
    );


  const seen = new Set();

  const uniquePlaces =
    allPlaces.filter((place) => {
      const key = place.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });


  const enrichedPlaces =
    uniquePlaces.map((place) => ({
      ...place,

      distanceKm: Number(
        distanceKm(
          latitude,
          longitude,
          Number(place.lat),
          Number(place.lon)
        ).toFixed(2)
      ),

      mapsUrl:
        `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
    }));


  enrichedPlaces.sort(
    (a, b) =>
      a.distanceKm -
      b.distanceKm
  );


  return enrichedPlaces;
};


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
      const places =
        await searchAllSources(
          latitude,
          longitude,
          radius
        );

      if (places.length > 0) {
        return {
          places:
            places.slice(0, 10),

          searchRadiusKm:
            radius / 1000,
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