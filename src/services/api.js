/**
 * Servicio para comunicarse con el backend y la IA
 */

// URL del backend (ajustar según tu configuración)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Envía productos al backend para análisis con IA
 * @param {Array} products - Array de productos
 * @returns {Promise<Object>} - Respuesta con productos ordenados
 */
export const analyzeProducts = async (products) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        analysis_date: new Date().toISOString(),
        request_type: 'product_ordering'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al analizar productos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en analyzeProducts:', error);
    throw error;
  }
};

/**
 * Simula el análisis de productos (para desarrollo sin backend)
 * ELIMINAR cuando tengas el backend real
 */
export const analyzeProductsMock = async (products) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Algoritmo simple de simulación basado en ventas y stock
  const analyzed = products.map(p => {
    // Calcular score (más ventas y menos stock = mayor prioridad)
    const salesScore = p.cantidad_vendida * 10;
    const stockScore = p.stock > 0 ? 100 / p.stock : 0;
    const priceScore = p.precio_unitario * 0.1;
    
    return {
      ...p,
      score: salesScore + stockScore + priceScore
    };
  });

  // Ordenar por score descendente
  analyzed.sort((a, b) => b.score - a.score);

  // Asignar nuevo orden
  const orderedProducts = analyzed.map((p, index) => ({
    ...p,
    orden_sugerido: index + 1,
    cambio: p.orden_actual - (index + 1),
    razon: generateReason(p, index + 1)
  }));

  return {
    success: true,
    data: {
      products: orderedProducts,
      analysis: {
        total_products: orderedProducts.length,
        changes_count: orderedProducts.filter(p => p.cambio !== 0).length,
        timestamp: new Date().toISOString(),
        metrics: calculateMetrics(products)
      }
    }
  };
};

/**
 * Genera razón del cambio de orden
 */
const generateReason = (product, newOrder) => {
  const cambio = product.orden_actual - newOrder;
  
  if (cambio === 0) {
    return 'Mantiene posición óptima';
  } else if (cambio > 0) {
    const reasons = [];
    if (product.cantidad_vendida > 5) reasons.push('alto volumen de ventas');
    if (product.stock < 20) reasons.push('stock limitado');
    if (product.precio_unitario > 50) reasons.push('alto valor');
    return `Subió ${cambio} posiciones: ${reasons.join(', ') || 'mejor desempeño'}`;
  } else {
    const reasons = [];
    if (product.cantidad_vendida < 3) reasons.push('bajas ventas');
    if (product.stock > 50) reasons.push('alto inventario');
    return `Bajó ${Math.abs(cambio)} posiciones: ${reasons.join(', ') || 'menor prioridad'}`;
  }
};

/**
 * Calcula métricas generales
 */
const calculateMetrics = (products) => {
  const totalVentas = products.reduce((sum, p) => sum + p.cantidad_vendida, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const valorInventario = products.reduce((sum, p) => sum + (p.stock * p.precio_unitario), 0);
  
  return {
    total_ventas: totalVentas,
    total_stock: totalStock,
    valor_inventario: valorInventario.toFixed(2),
    promedio_ventas: (totalVentas / products.length).toFixed(2)
  };
};

/**
 * Guarda el nuevo orden en el backend
 * @param {Array} products - Productos con nuevo orden
 */
export const saveNewOrder = async (products) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        products,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Error al guardar el orden');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en saveNewOrder:', error);
    throw error;
  }
};

/**
 * Obtiene historial de análisis
 */
export const getAnalysisHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    
    if (!response.ok) {
      throw new Error('Error al obtener historial');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getAnalysisHistory:', error);
    throw error;
  }
};