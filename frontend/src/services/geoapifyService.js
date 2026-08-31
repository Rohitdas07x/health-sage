const axios = require("axios");

const searchGeoapify = async (latitude, longitude, radiusMeters) => {
  const url = "https://api.geoapify.com/v2/places";
  const response = await axios.get(url, {
    params: {
      categories: "healthcare.hospital,healthcare.clinic_or_praxis",
      filter: `circle:${longitude},${latitude},${radiusMeters}`,
      limit: 20,
      apiKey: process.env.GEOAPIFY_API_KEY,
    },
  });

  return response.data.features.map((f) => ({
    name: f.properties.name || "Unnamed Facility",
    address: f.properties.formatted || "Address not available",
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
    source: "geoapify",
  }));
};

module.exports = { searchGeoapify };