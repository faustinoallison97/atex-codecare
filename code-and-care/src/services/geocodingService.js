import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

export const searchAddress = async (query, options = {}) => {
  try {
    // Parâmetros padrão + opções personalizadas
    const params = new URLSearchParams({
      access_token: MAPBOX_TOKEN,
      autocomplete: true,
      language: 'pt-BR',
      country: 'br',
      // Incluir todos os tipos possíveis para uma busca mais abrangente
      types: 'address,poi,place,postcode,locality,neighborhood,district',
      limit: 10, // Aumentar o limite para mostrar mais resultados
      ...options
    });

    // Se a busca incluir a localização atual do usuário, adicionar parâmetros de proximidade
    if (options.proximity) {
      params.append('proximity', `${options.proximity[0]},${options.proximity[1]}`);
    }

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar endereço');
    }
    
    const data = await response.json();
    return data.features;
  } catch (error) {
    console.error('Erro de geocodificação:', error);
    throw error;
  }
};

export async function reverseGeocode([longitude, latitude]) {
  const response = await geocodingClient.reverseGeocode({
    query: [longitude, latitude],
    limit: 1,
  }).send();

  const feature = response.body.features[0];
  return feature ? feature.place_name : 'Endereço não encontrado';
}
