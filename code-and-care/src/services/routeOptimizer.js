/**
 * Serviço para otimizar a rota entre múltiplos pontos
 * Implementa uma versão simplificada do problema do caixeiro viajante
 */

// Calcula a distância em linha reta entre dois pontos (coordenadas)
const calculateDistance = (point1, point2) => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  // Conversão de graus para radianos
  const toRad = (value) => value * Math.PI / 180;
  
  // Raio da Terra em km
  const R = 6371;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance; // em quilômetros
};

// Algoritmo guloso para encontrar um caminho aproximado
export const optimizeRoute = (points, startPointIndex = 0) => {
  if (!points || points.length <= 2) {
    return [...points]; // Não há o que otimizar com 0, 1 ou 2 pontos
  }
  
  // Matriz de distâncias entre todos os pontos
  const distances = [];
  for (let i = 0; i < points.length; i++) {
    distances[i] = [];
    for (let j = 0; j < points.length; j++) {
      distances[i][j] = calculateDistance(points[i], points[j]);
    }
  }
  
  // Array de pontos visitados e não visitados
  const visited = Array(points.length).fill(false);
  const optimizedIndices = [startPointIndex]; // Começamos pelo ponto definido
  visited[startPointIndex] = true;
  
  // Enquanto houver pontos não visitados
  while (optimizedIndices.length < points.length) {
    let lastPoint = optimizedIndices[optimizedIndices.length - 1];
    let nextPoint = -1;
    let minDistance = Infinity;
    
    // Encontrar o ponto mais próximo não visitado
    for (let i = 0; i < points.length; i++) {
      if (!visited[i] && distances[lastPoint][i] < minDistance) {
        minDistance = distances[lastPoint][i];
        nextPoint = i;
      }
    }
    
    // Adicionar o próximo ponto e marcá-lo como visitado
    if (nextPoint !== -1) {
      optimizedIndices.push(nextPoint);
      visited[nextPoint] = true;
    }
  }
  
  // Criar o array de pontos otimizado
  const optimizedPoints = optimizedIndices.map(index => points[index]);
  return optimizedPoints;
};

// Otimizar rota e também retornar os novos índices (para atualizar endereços)
export const optimizeRouteWithIndices = (points, startPointIndex = 0) => {
  if (!points || points.length <= 2) {
    return {
      points: [...points],
      indices: points.map((_, i) => i)
    };
  }
  
  // Matriz de distâncias entre todos os pontos
  const distances = [];
  for (let i = 0; i < points.length; i++) {
    distances[i] = [];
    for (let j = 0; j < points.length; j++) {
      distances[i][j] = calculateDistance(points[i], points[j]);
    }
  }
  
  // Array de pontos visitados e não visitados
  const visited = Array(points.length).fill(false);
  const optimizedIndices = [startPointIndex];
  visited[startPointIndex] = true;
  
  // Enquanto houver pontos não visitados
  while (optimizedIndices.length < points.length) {
    let lastPoint = optimizedIndices[optimizedIndices.length - 1];
    let nextPoint = -1;
    let minDistance = Infinity;
    
    // Encontrar o ponto mais próximo não visitado
    for (let i = 0; i < points.length; i++) {
      if (!visited[i] && distances[lastPoint][i] < minDistance) {
        minDistance = distances[lastPoint][i];
        nextPoint = i;
      }
    }
    
    // Adicionar o próximo ponto e marcá-lo como visitado
    if (nextPoint !== -1) {
      optimizedIndices.push(nextPoint);
      visited[nextPoint] = true;
    }
  }
  
  // Criar o array de pontos otimizado
  const optimizedPoints = optimizedIndices.map(index => points[index]);
  
  return {
    points: optimizedPoints,
    indices: optimizedIndices
  };
};