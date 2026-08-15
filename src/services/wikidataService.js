const axios = require("axios");

const searchWikidata = async (latitude, longitude, radiusKm) => {
  const query = `
    SELECT ?hospital ?hospitalLabel ?coord WHERE {
      ?hospital wdt:P31/wdt:P279* wd:Q16917.
      ?hospital wdt:P625 ?coord.
      SERVICE wikibase:around {
        ?hospital wdt:P625 ?coord.
        bd:serviceParam wikibase:center "Point(${longitude} ${latitude})"^^geo:wktLiteral.
        bd:serviceParam wikibase:radius "${radiusKm}".
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 15
  `;

  const response = await axios.get("https://query.wikidata.org/sparql", {
    params: { query, format: "json" },
    headers: { "User-Agent": "HealthSage/1.0 (student project)" },
  });

  return response.data.results.bindings.map((b) => {
    const coordMatch = b.coord.value.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
    return {
      name: b.hospitalLabel.value,
      address: "Wikidata entry — verify address before visiting",
      lat: coordMatch ? parseFloat(coordMatch[2]) : null,
      lon: coordMatch ? parseFloat(coordMatch[1]) : null,
      source: "wikidata",
    };
  });
};

module.exports = { searchWikidata };