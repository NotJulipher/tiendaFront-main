import { useState } from 'react';
import './App.css';
import { FileUploader } from './Components/FileUploader';
import { ProductTable } from './Components/ProductTable';
import { ComparisonView } from './Components/ComparisonView';
import { analyzeProductsMock } from './services/api';
import { exportToCSV } from './utils/fileParser';

export default function App() {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [fileName, setFileName] = useState(null);
  const [analyzedProducts, setAnalyzedProducts] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('upload'); // 'upload', 'loaded', 'comparison'

  // Manejar carga de archivo
  const handleFileLoaded = (loadedProducts, name) => {
    setProducts(loadedProducts);
    setFileName(name);
    setView('loaded');
    setError(null);
  };

  // Analizar productos con IA
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      // Usar mock mientras no tengas backend
      // Cuando tengas backend, cambiar a: analyzeProducts(products)
      const response = await analyzeProductsMock(products);

      if (response.success) {
        setAnalyzedProducts(response.data.products);
        setAnalysisData(response.data.analysis);
        setView('comparison');
      } else {
        throw new Error('Error en el análisis');
      }
    } catch (err) {
      setError(err.message || 'Error al analizar productos');
      console.error('Error en análisis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar cambios sugeridos
  const handleApplyChanges = () => {
    // Actualizar orden actual con el sugerido
    const updatedProducts = analyzedProducts.map(p => ({
      ...p,
      orden_actual: p.orden_sugerido
    }));

    setProducts(updatedProducts);
    setView('loaded');
    setAnalyzedProducts(null);
    setAnalysisData(null);
    
    // Opcional: Guardar en backend
    // saveNewOrder(updatedProducts);
  };

  // Cancelar comparación
  const handleCancelComparison = () => {
    setView('loaded');
    setAnalyzedProducts(null);
    setAnalysisData(null);
  };

  // Descargar resultados
  const handleExport = () => {
    const dataToExport = analyzedProducts || products;
    exportToCSV(dataToExport, `productos_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Reiniciar aplicación
  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas cargar un nuevo archivo? Se perderán los datos actuales.')) {
      setProducts([]);
      setFileName(null);
      setAnalyzedProducts(null);
      setAnalysisData(null);
      setView('upload');
      setError(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <header className="mb-4">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h1 className="fw-bold mb-1">
              🤖 Optimizador de Productos con IA
            </h1>
            <p className="text-muted mb-0">
              Sistema inteligente para optimizar el orden de productos basado en ventas
            </p>
          </div>
          <div className="col-md-4 text-end">
            {fileName && (
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleExport}
                  disabled={loading}
                >
                  📥 Exportar
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleReset}
                  disabled={loading}
                >
                  🔄 Nuevo Archivo
                </button>
              </div>
            )}
          </div>
        </div>
        
        {fileName && (
          <div className="mt-2">
            <span className="badge bg-light text-dark">
              📄 {fileName} • {products.length} productos
            </span>
          </div>
        )}
      </header>

      {/* Error global */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Vista: Cargar archivo */}
      {view === 'upload' && (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <FileUploader 
              onFileLoaded={handleFileLoaded}
              disabled={loading}
            />
            
            {/* Instrucciones */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h5 className="card-title">📖 ¿Cómo funciona?</h5>
                <ol className="mb-0">
                  <li className="mb-2">
                    <strong>Carga tu archivo:</strong> Sube un CSV o Excel con los datos de ventas del día anterior
                  </li>
                  <li className="mb-2">
                    <strong>Visualiza productos:</strong> Revisa el orden actual de tus productos
                  </li>
                  <li className="mb-2">
                    <strong>Analiza con IA:</strong> Nuestra IA analizará patrones de venta, stock y precios
                  </li>
                  <li className="mb-0">
                    <strong>Aplica cambios:</strong> Obtén recomendaciones y aplica el nuevo orden óptimo
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Productos cargados */}
      {view === 'loaded' && (
        <div>
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">Productos Cargados</h5>
                      <p className="text-muted mb-0">
                        Orden actual de {products.length} productos
                      </p>
                    </div>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleAnalyze}
                      disabled={loading || products.length === 0}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Analizando...
                        </>
                      ) : (
                        <>
                          🤖 Analizar con IA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductTable 
            products={products}
            title="Orden Actual de Productos"
          />
        </div>
      )}

      {/* Vista: Comparación */}
      {view === 'comparison' && analyzedProducts && (
        <ComparisonView
          originalProducts={products}
          analyzedProducts={analyzedProducts}
          analysisData={analysisData}
          onApplyChanges={handleApplyChanges}
          onCancel={handleCancelComparison}
        />
      )}

      {/* Footer */}
      <footer className="mt-5 pt-4 border-top text-center text-muted">
        <p className="small mb-0">
          Optimizador de Productos con IA • Desarrollado con React + Bootstrap
        </p>
      </footer>
    </div>
  );
}