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
      fecha: '2024-01-15',
      nombre_producto: 'Producto Ejemplo 1',
      descripcion: 'Descripción del producto',
      'cantidad/stock': 50,
      precio_unitario: 25.99,
      cantidad_unds_vendidas: 10,
      orden: 1
    },
    {
      fecha: '2024-01-15',
      nombre_producto: 'Producto Ejemplo 2',
      descripcion: 'Otra descripción',
      'cantidad/stock': 30,
      precio_unitario: 15.50,
      cantidad_unds_vendidas: 5,
      orden: 2
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