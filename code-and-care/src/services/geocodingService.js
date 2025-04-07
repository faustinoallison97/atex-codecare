import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN = 'SUA_CHAVE_MAPBOX';
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

export async function searchAddress(query) {
  const response = await geocodingClient.forwardGeocode({
    query,
    limit: 5,
    countries: ['br'],
  }).send();

  return response.body.features; // cada feature tem geometry (lon/lat) e place_name
}
