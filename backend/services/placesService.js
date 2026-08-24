const axios = require("axios");
const { searchGeoapify } = require("./geoapifyService");
const { searchWikidata } = require("./wikidataService");

// ─────────────────────────────────────────────
// OVERPASS SEARCH
// ─────────────────────────────────────────────

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
      way["amenity"="clinic"](around:${radiusMeters},${latitude},${longitude});

      way["healthcare"="hospital"](around:${radiusMeters},${latitude},${longitude});
      way["healthcare"="clinic"](around:${radiusMeters},${latitude},${longitude});
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
      timeout: 30000,
    }
  );

  if (
    !response.data ||
    !Array.isArray(response.data.elements)
  ) {
    return [];
  }

  return response.data.elements
    .map((el) => {
      const lat =
        el.lat ||
        el.center?.lat;

      const lon =
        el.lon ||
        el.center?.lon;

      const tags =
        el.tags || {};

      let address =
        tags["addr:full"];

      if (!address) {
        if (
          tags["addr:housenumber"] &&
          tags["addr:street"]
        ) {
          address =
            `${tags["addr:housenumber"]} ${tags["addr:street"]}`;
        } else {
          address =
            tags["addr:street"] ||
            tags["addr:city"] ||
            tags["addr:district"] ||
            "Address not available";
        }
      }

      return {
        name:
          tags.name ||
          "Unnamed Hospital",

        address,

        lat,
        lon,

        source: "overpass",
      };
    })
    .filter(
      (place) =>
        place.name &&
        Number.isFinite(
          Number(place.lat)
        ) &&
        Number.isFinite(
          Number(place.lon)
        )
    );
};


// ─────────────────────────────────────────────
// DISTANCE CALCULATOR
// ─────────────────────────────────────────────

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
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};


// ─────────────────────────────────────────────
// NORMALIZE HOSPITAL NAME
// ─────────────────────────────────────────────

const normalizeName = (
  name = ""
) => {
  return name
    .toLowerCase()
    .replace(
      /\b(old campus|new campus|building|block|opd|department|unit|wing)\b/gi,
      ""
    )
    .replace(
      /[^a-z0-9\s]/gi,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};


// ─────────────────────────────────────────────
// GOOGLE MAPS LINK
// ─────────────────────────────────────────────

const createMapsLink = (
  name,
  latitude,
  longitude
) => {
  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null
  ) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};


// ─────────────────────────────────────────────
// SEARCH ALL SOURCES
// ─────────────────────────────────────────────

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


  // কোন API fail করলে সেটার জন্য পুরো search বন্ধ হবে না

  results.forEach(
    (result, index) => {
      if (
        result.status === "rejected"
      ) {
        const sources = [
          "Overpass",
          "Geoapify",
          "Wikidata",
        ];

        console.error(
          `${sources[index]} search failed:`,
          result.reason?.message ||
            result.reason
        );
      }
    }
  );


  const allPlaces =
    results
      .filter(
        (result) =>
          result.status === "fulfilled"
      )
      .flatMap(
        (result) =>
          Array.isArray(result.value)
            ? result.value
            : []
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


  // ─────────────────────────────────────────
  // REMOVE DUPLICATES
  // ─────────────────────────────────────────

  const uniquePlaces = [];

  for (
    const place of allPlaces
  ) {
    const normalized =
      normalizeName(
        place.name
      );

    if (!normalized) {
      continue;
    }

    const duplicate =
      uniquePlaces.find(
        (existing) => {
          const existingName =
            normalizeName(
              existing.name
            );

          return (
            existingName ===
              normalized ||
            existingName.includes(
              normalized
            ) ||
            normalized.includes(
              existingName
            )
          );
        }
      );


    if (duplicate) {
      // ভালো address থাকলে update করবে

      if (
        (
          !duplicate.address ||
          duplicate.address ===
            "Address not available"
        ) &&
        place.address &&
        place.address !==
          "Address not available"
      ) {
        duplicate.address =
          place.address;
      }

      continue;
    }


    uniquePlaces.push({
      name: place.name,

      address:
        place.address ||
        "Address not available",

      lat:
        Number(place.lat),

      lon:
        Number(place.lon),

      source:
        place.source ||
        "unknown",
    });
  }


  // ─────────────────────────────────────────
  // ADD DISTANCE + MAP LINK
  // ─────────────────────────────────────────

  const enrichedPlaces =
    uniquePlaces.map(
      (place) => {
        const distance =
          distanceKm(
            Number(latitude),
            Number(longitude),
            place.lat,
            place.lon
          );

        return {
          ...place,

          distanceKm:
            Number(
              distance.toFixed(2)
            ),

          mapsUrl:
            createMapsLink(
              place.name,
              place.lat,
              place.lon
            ),
        };
      }
    );


  // ─────────────────────────────────────────
  // NEAREST FIRST
  // ─────────────────────────────────────────

  enrichedPlaces.sort(
    (a, b) =>
      a.distanceKm -
      b.distanceKm
  );

  return enrichedPlaces;
};


// ─────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────

const findNearbyHospitals =
  async (
    latitude,
    longitude
  ) => {

    const lat =
      Number(latitude);

    const lon =
      Number(longitude);


    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      throw new Error(
        "Invalid location coordinates."
      );
    }


    const radiiToTry = [
      5000,
      15000,
      30000,
      60000,
      100000,
    ];


    for (
      const radius of radiiToTry
    ) {
      try {
        console.log(
          `Searching hospitals within ${radius / 1000} km...`
        );

        const places =
          await searchAllSources(
            lat,
            lon,
            radius
          );


        if (
          places.length > 0
        ) {
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


// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

module.exports = {
  findNearbyHospitals,
};