import { ProductTable } from './ProductTable';

export function ComparisonView({ 
  originalProducts, 
  analyzedProducts, 
  analysisData,
  onApplyChanges,
  onCancel 
}) {
  const changesCount = analyzedProducts.filter(p => p.cambio !== 0).length;

  return (
    <div className="container-fluid">
      {/* Header con métricas */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1">🤖 Análisis Completado</h4>
                  <p className="text-muted mb-0">
                    {analysisData?.timestamp 
                      ? new Date(analysisData.timestamp).toLocaleString('es-ES')
                      : 'Ahora'}
                  </p>
                </div>
                
                <div className="text-end">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={onCancel}
                    >
                      ← Volver
                    </button>
                    <button 
                      className="btn btn-success"
                      onClick={onApplyChanges}
                    >
                      ✓ Aplicar Cambios
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Métricas */}
              {analysisData && (
                <div className="row mt-4 g-3">
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center">
                      <small className="text-muted d-block">Productos Analizados</small>
                      <h3 className="mb-0">{analysisData.total_products}</h3>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="border rounded p-3 text-center bg-warning bg-opacity-10">
                      <small className="text-muted d-block">Cambios Sugeridos</small>
                      <h3 className="mb-0 text-warning">{changesCount}</h3>
                    </div>
                  </div>
                  {analysisData.metrics && (
                    <>
                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small className="text-muted d-block">Total Ventas</small>
                          <h3 className="mb-0">{analysisData.metrics.total_ventas}</h3>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="border rounded p-3 text-center">
                          <small className="text-muted d-block">Valor Inventario</small>
                          <h3 className="mb-0 small">
                            ${analysisData.metrics.valor_inventario}
                          </h3>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de comparación */}
      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className="nav-link active"
            id="suggested-tab"
            data-bs-toggle="tab"
            data-bs-target="#suggested"
            type="button"
            role="tab"
          >
            🎯 Orden Sugerido
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="current-tab"
            data-bs-toggle="tab"
            data-bs-target="#current"
            type="button"
            role="tab"
          >
            📋 Orden Actual
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className="nav-link"
            id="changes-tab"
            data-bs-toggle="tab"
            data-bs-target="#changes"
            type="button"
            role="tab"
          >
            📊 Solo Cambios ({changesCount})
          </button>
        </li>
      </ul>

      {/* Tab content */}
      <div className="tab-content">
        {/* Orden Sugerido */}
        <div
          className="tab-pane fade show active"
          id="suggested"
          role="tabpanel"
        >
          <ProductTable
            products={analyzedProducts}
            showSuggested={true}
            title="Orden Sugerido por IA"
          />
        </div>

        {/* Orden Actual */}
        <div
          className="tab-pane fade"
          id="current"
          role="tabpanel"
        >
          <ProductTable
            products={originalProducts}
            showSuggested={false}
            title="Orden Actual"
          />
        </div>

        {/* Solo Cambios */}
        <div
          className="tab-pane fade"
          id="changes"
          role="tabpanel"
        >
          {changesCount > 0 ? (
            <ProductTable
              products={analyzedProducts.filter(p => p.cambio !== 0)}
              showSuggested={true}
              title="Productos con Cambios"
            />
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div style={{ fontSize: '3rem' }}>✓</div>
                <h5 className="mt-3">No hay cambios sugeridos</h5>
                <p className="text-muted">
                  El orden actual es óptimo según el análisis de IA
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}