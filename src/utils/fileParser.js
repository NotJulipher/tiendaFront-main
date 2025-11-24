import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parsea un archivo CSV o Excel y retorna los productos
 * @param {File} file - Archivo cargado
 * @returns {Promise<Array>} - Array de productos
 */
export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    
    // Detectar tipo de archivo
    if (fileName.endsWith('.csv')) {
      parseCSV(file, resolve, reject);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      parseExcel(file, resolve, reject);
    } else {
      reject(new Error('Formato no soportado. Use CSV o Excel (.xlsx, .xls)'));
    }
  });
};

/**
 * Parsea archivo CSV
 */
const parseCSV = (file, resolve, reject) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
    complete: (results) => {
      try {
        const products = validateAndTransform(results.data);
        resolve(products);
      } catch (error) {
        reject(error);
      }
    },
    error: (error) => {
      reject(new Error(`Error al leer CSV: ${error.message}`));
    }
  });
};

/**
 * Parsea archivo Excel
 */
const parseExcel = (file, resolve, reject) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Leer primera hoja
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
        raw: false,
        defval: ''
      });
      
      // Normalizar headers a minúsculas
      const normalizedData = jsonData.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
          newRow[key.toLowerCase().trim()] = row[key];
        });
        return newRow;
      });
      
      const products = validateAndTransform(normalizedData);
      resolve(products);
    } catch (error) {
      reject(new Error(`Error al leer Excel: ${error.message}`));
    }
  };
  
  reader.onerror = () => {
    reject(new Error('Error al leer el archivo'));
  };
  
  reader.readAsArrayBuffer(file);
};

/**
 * Valida y transforma los datos a formato esperado
 */
const validateAndTransform = (data) => {
  if (!data || data.length === 0) {
    throw new Error('El archivo está vacío');
  }
  
  // Mapeo de posibles nombres de columnas
  const columnMapping = {
    fecha: ['fecha', 'date', 'fecha_venta'],
    nombre_producto: ['nombre_producto', 'producto', 'nombre', 'product', 'name'],
    descripcion: ['descripcion', 'description', 'desc'],
    stock: ['stock', 'cantidad', 'cantidad/stock', 'inventory'],
    precio_unitario: ['precio_unitario', 'precio', 'price', 'precio_unit'],
    cantidad_vendida: ['cantidad_unds_vendidas', 'vendidas', 'cantidad_vendida', 'sold', 'ventas'],
    orden_actual: ['orden', 'orden_actual', 'posicion', 'order', 'position']
  };
  
  const products = data.map((row, index) => {
    // Función auxiliar para obtener valor de columna con varios posibles nombres
    const getValue = (possibleNames) => {
      for (let name of possibleNames) {
        if (row[name] !== undefined && row[name] !== '') {
          return row[name];
        }
      }
      return null;
    };
    
    const product = {
      id: `prod_${Date.now()}_${index}`,
      fecha: getValue(columnMapping.fecha) || new Date().toISOString().split('T')[0],
      nombre_producto: getValue(columnMapping.nombre_producto),
      descripcion: getValue(columnMapping.descripcion) || '',
      stock: parseInt(getValue(columnMapping.stock)) || 0,
      precio_unitario: parseFloat(getValue(columnMapping.precio_unitario)) || 0,
      cantidad_vendida: parseInt(getValue(columnMapping.cantidad_vendida)) || 0,
      orden_actual: parseInt(getValue(columnMapping.orden_actual)) || (index + 1),
      orden_sugerido: null // Se llenará después del análisis
    };
    
    // Validar campos obligatorios
    if (!product.nombre_producto) {
      throw new Error(`Fila ${index + 2}: Falta el nombre del producto`);
    }
    
    return product;
  });
  
  return products;
};

/**
 * Genera template CSV para descarga
 */
export const generateTemplateCSV = () => {
  const template = [
    {
      fecha: '2025-01-15',
      nombre_producto: 'Arroz 1kg',
      descripcion: 'Arroz blanco calidad estandar',
      'cantidad/stock': 69,
      precio_unitario: 2500,
      cantidad_unds_vendidas: 26,
      orden: 1
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Azucar 1kg',
      descripcion: 'Azucar refinada',
      'cantidad/stock': 51,
      precio_unitario: 2200,
      cantidad_unds_vendidas: 36,
      orden: 2
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Leche Entera 1L',
      descripcion: 'Leche entera UHT',
      'cantidad/stock': 11,
      precio_unitario: 3800,
      cantidad_unds_vendidas: 8,
      orden: 3
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Pan Tajado',
      descripcion: 'Pan tajado blanco',
      'cantidad/stock': 38,
      precio_unitario: 4500,
      cantidad_unds_vendidas: 18,
      orden: 4
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Huevos Docena',
      descripcion: 'Huevos frescos',
      'cantidad/stock': 44,
      precio_unitario: 12000,
      cantidad_unds_vendidas: 25,
      orden: 5
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Aceite 1L',
      descripcion: 'Aceite vegetal',
      'cantidad/stock': 46,
      precio_unitario: 9500,
      cantidad_unds_vendidas: 28,
      orden: 6
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Fideos 500g',
      descripcion: 'Pasta tipo espagueti',
      'cantidad/stock': 64,
      precio_unitario: 2800,
      cantidad_unds_vendidas: 20,
      orden: 7
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Sal 1kg',
      descripcion: 'Sal refinada',
      'cantidad/stock': 51,
      precio_unitario: 1500,
      cantidad_unds_vendidas: 34,
      orden: 8
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Cafe 250g',
      descripcion: 'Cafe molido',
      'cantidad/stock': 31,
      precio_unitario: 8500,
      cantidad_unds_vendidas: 5,
      orden: 9
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Chocolate Mesa 250g',
      descripcion: 'Chocolate para preparar',
      'cantidad/stock': 45,
      precio_unitario: 4000,
      cantidad_unds_vendidas: 30,
      orden: 10
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Detergente 1kg',
      descripcion: 'Detergente en polvo',
      'cantidad/stock': 28,
      precio_unitario: 7200,
      cantidad_unds_vendidas: 8,
      orden: 11
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Jabon Bano',
      descripcion: 'Jabon en barra',
      'cantidad/stock': 16,
      precio_unitario: 1800,
      cantidad_unds_vendidas: 14,
      orden: 12
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Shampoo 350ml',
      descripcion: 'Shampoo familiar',
      'cantidad/stock': 28,
      precio_unitario: 6200,
      cantidad_unds_vendidas: 21,
      orden: 13
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Crema Dental 120g',
      descripcion: 'Crema dental sabor menta',
      'cantidad/stock': 54,
      precio_unitario: 3500,
      cantidad_unds_vendidas: 23,
      orden: 14
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Papel Higienico 4un',
      descripcion: 'Rollo doble hoja',
      'cantidad/stock': 45,
      precio_unitario: 6000,
      cantidad_unds_vendidas: 24,
      orden: 15
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Jabon Liquido 500ml',
      descripcion: 'Jabon liquido manos',
      'cantidad/stock': 30,
      precio_unitario: 5500,
      cantidad_unds_vendidas: 3,
      orden: 16
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Gaseosa 1.5L',
      descripcion: 'Bebida sabor cola',
      'cantidad/stock': 42,
      precio_unitario: 6500,
      cantidad_unds_vendidas: 33,
      orden: 17
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Galletas Surtidas',
      descripcion: 'Galletas surtidas dulces',
      'cantidad/stock': 49,
      precio_unitario: 2500,
      cantidad_unds_vendidas: 15,
      orden: 18
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Avena 500g',
      descripcion: 'Avena en hojuelas',
      'cantidad/stock': 71,
      precio_unitario: 3200,
      cantidad_unds_vendidas: 12,
      orden: 19
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Atun Lata 170g',
      descripcion: 'Atun en aceite',
      'cantidad/stock': 20,
      precio_unitario: 5200,
      cantidad_unds_vendidas: 29,
      orden: 20
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Sardinas Lata',
      descripcion: 'Sardinas en salsa de tomate',
      'cantidad/stock': 50,
      precio_unitario: 3000,
      cantidad_unds_vendidas: 4,
      orden: 21
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Yogur 1L',
      descripcion: 'Yogur natural',
      'cantidad/stock': 41,
      precio_unitario: 5200,
      cantidad_unds_vendidas: 22,
      orden: 22
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Jamon 250g',
      descripcion: 'Jamon de cerdo rebanado',
      'cantidad/stock': 33,
      precio_unitario: 7800,
      cantidad_unds_vendidas: 3,
      orden: 23
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Queso 250g',
      descripcion: 'Queso fresco',
      'cantidad/stock': 71,
      precio_unitario: 8500,
      cantidad_unds_vendidas: 1,
      orden: 24
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Mantequilla 250g',
      descripcion: 'Mantequilla tradicional',
      'cantidad/stock': 37,
      precio_unitario: 5400,
      cantidad_unds_vendidas: 26,
      orden: 25
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Refresco Polvo 1L',
      descripcion: 'Bebida instantanea en polvo',
      'cantidad/stock': 76,
      precio_unitario: 1200,
      cantidad_unds_vendidas: 16,
      orden: 26
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Gaseosa 600ml',
      descripcion: 'Bebida sabor cola',
      'cantidad/stock': 30,
      precio_unitario: 3000,
      cantidad_unds_vendidas: 19,
      orden: 27
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Agua 600ml',
      descripcion: 'Agua purificada',
      'cantidad/stock': 34,
      precio_unitario: 2400,
      cantidad_unds_vendidas: 24,
      orden: 28
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Agua 1.5L',
      descripcion: 'Agua purificada',
      'cantidad/stock': 20,
      precio_unitario: 4000,
      cantidad_unds_vendidas: 22,
      orden: 29
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Helado Paleta',
      descripcion: 'Helado sabor crema',
      'cantidad/stock': 35,
      precio_unitario: 1500,
      cantidad_unds_vendidas: 23,
      orden: 30
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Chicles',
      descripcion: 'Goma de mascar menta',
      'cantidad/stock': 67,
      precio_unitario: 200,
      cantidad_unds_vendidas: 8,
      orden: 31
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Caramelos Surtidos',
      descripcion: 'Caramelos variados',
      'cantidad/stock': 62,
      precio_unitario: 100,
      cantidad_unds_vendidas: 23,
      orden: 32
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Papas Fritas 30g',
      descripcion: 'Papas fritas clasicas',
      'cantidad/stock': 16,
      precio_unitario: 1500,
      cantidad_unds_vendidas: 39,
      orden: 33
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Papas Fritas 90g',
      descripcion: 'Papas fritas grandes',
      'cantidad/stock': 75,
      precio_unitario: 3500,
      cantidad_unds_vendidas: 34,
      orden: 34
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Mani 50g',
      descripcion: 'Mani salado',
      'cantidad/stock': 24,
      precio_unitario: 1800,
      cantidad_unds_vendidas: 5,
      orden: 35
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Nueces 50g',
      descripcion: 'Nueces mixtas',
      'cantidad/stock': 72,
      precio_unitario: 3500,
      cantidad_unds_vendidas: 25,
      orden: 36
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Pan Dulce',
      descripcion: 'Pan dulce pequeno',
      'cantidad/stock': 60,
      precio_unitario: 800,
      cantidad_unds_vendidas: 7,
      orden: 37
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Chocolatina Pequena',
      descripcion: 'Chocolate pequeño',
      'cantidad/stock': 32,
      precio_unitario: 1200,
      cantidad_unds_vendidas: 15,
      orden: 38
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Barra Cereal',
      descripcion: 'Barra de cereal',
      'cantidad/stock': 29,
      precio_unitario: 2500,
      cantidad_unds_vendidas: 35,
      orden: 39
    },
    {
      fecha: '2025-01-15',
      nombre_producto: 'Gomitas',
      descripcion: 'Gomitas dulces',
      'cantidad/stock': 72,
      precio_unitario: 1000,
      cantidad_unds_vendidas: 18,
      orden: 40
    }
  ];
  
  const csv = Papa.unparse(template);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template_productos.csv';
  link.click();
};

/**
 * Exportar productos a CSV
 */
export const exportToCSV = (products, filename = 'productos_ordenados.csv') => {
  const dataToExport = products.map(p => ({
    fecha: p.fecha,
    nombre_producto: p.nombre_producto,
    descripcion: p.descripcion,
    stock: p.stock,
    precio_unitario: p.precio_unitario,
    cantidad_vendida: p.cantidad_vendida,
    orden_anterior: p.orden_actual,
    orden_sugerido: p.orden_sugerido || p.orden_actual
  }));
  
  const csv = Papa.unparse(dataToExport);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};