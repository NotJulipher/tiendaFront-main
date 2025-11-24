export function ProductTable({ products, showSuggested = false, title }) {
  if (!products || products.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center text-muted">
          <p>No hay productos para mostrar</p>
        </div>
      </div>
    );
  }

  const sortedProducts = showSuggested && products[0]?.orden_sugerido
    ? [...products].sort((a, b) => a.orden_sugerido - b.orden_sugerido)
    : [...products].sort((a, b) => a.orden_actual - b.orden_actual);

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">{title || 'Productos'}</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '60px' }}>
                  {showSuggested ? 'Orden Nuevo' : 'Orden'}
                </th>
                {showSuggested && <th style={{ width: '80px' }}>Cambio</th>}
                <th>Producto</th>
                <th>Descripción</th>
                <th style={{ width: '100px' }}>Stock</th>
                <th style={{ width: '120px' }}>Precio Unit.</th>
                <th style={{ width: '100px' }}>Vendidas</th>
                {showSuggested && <th>Razón</th>}
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => {
                const cambio = showSuggested 
                  ? product.orden_actual - product.orden_sugerido 
                  : 0;
                
                return (
                  <tr key={product.id}>
                    <td>
                      <span className="badge bg-primary rounded-pill">
                        {showSuggested ? product.orden_sugerido : product.orden_actual}
                      </span>
                    </td>
                    
                    {showSuggested && (
                      <td>
                        {cambio !== 0 && (
                          <span
                            className={`badge ${
                              cambio > 0 ? 'bg-success' : 'bg-danger'
                            }`}
                          >
                            {cambio > 0 ? '↑' : '↓'} {Math.abs(cambio)}
                          </span>
                        )}
                        {cambio === 0 && (
                          <span className="badge bg-secondary">━</span>
                        )}
                      </td>
                    )}
                    
                    <td>
                      <strong>{product.nombre_producto}</strong>
                    </td>
                    
                    <td>
                      <small className="text-muted">
                        {product.descripcion || '—'}
                      </small>
                    </td>
                    
                    <td>
                      <span className={`badge ${
                        product.stock < 10 ? 'bg-danger' :
                        product.stock < 30 ? 'bg-warning' :
                        'bg-success'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    
                    <td>
                      <strong>${product.precio_unitario.toFixed(2)}</strong>
                    </td>
                    
                    <td>
                      <span className="badge bg-info">
                        {product.cantidad_vendida}
                      </span>
                    </td>
                    
                    {showSuggested && (
                      <td>
                        <small className="text-muted">
                          {product.razon || '—'}
                        </small>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card-footer bg-light">
        <div className="row text-center">
          <div className="col">
            <small className="text-muted">Total Productos</small>
            <div><strong>{products.length}</strong></div>
          </div>
          <div className="col">
            <small className="text-muted">Total Ventas</small>
            <div>
              <strong>
                {products.reduce((sum, p) => sum + p.cantidad_vendida, 0)}
              </strong>
            </div>
          </div>
          <div className="col">
            <small className="text-muted">Stock Total</small>
            <div>
              <strong>
                {products.reduce((sum, p) => sum + p.stock, 0)}
              </strong>
            </div>
          </div>
          <div className="col">
            <small className="text-muted">Valor Inventario</small>
            <div>
              <strong>
                $
                {products
                  .reduce((sum, p) => sum + p.stock * p.precio_unitario, 0)
                  .toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}