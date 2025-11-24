import { useState, useRef } from 'react';
import { parseFile, generateTemplateCSV } from '../utils/fileParser';

export function FileUploader({ onFileLoaded, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const products = await parseFile(file);
      onFileLoaded(products, file.name);
    } catch (err) {
      setError(err.message);
      console.error('Error al procesar archivo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">📂 Cargar Productos</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={generateTemplateCSV}
            type="button"
          >
            📥 Descargar Template
          </button>
        </div>

        <div
          className={`border rounded p-4 text-center ${
            isDragging ? 'border-primary bg-light' : 'border-2 border-dashed'
          } ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={disabled ? undefined : handleClick}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="d-none"
            disabled={disabled || loading}
          />

          {loading ? (
            <div>
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted mb-0">Procesando archivo...</p>
            </div>
          ) : (
            <div>
              <div className="mb-3" style={{ fontSize: '3rem' }}>
                📊
              </div>
              <p className="mb-2">
                <strong>Arrastra un archivo aquí</strong> o haz clic para seleccionar
              </p>
              <p className="text-muted small mb-0">
                Formatos soportados: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="mt-3">
          <p className="small text-muted mb-2">
            <strong>Columnas requeridas:</strong>
          </p>
          <ul className="small text-muted mb-0">
            <li>fecha</li>
            <li>nombre_producto</li>
            <li>descripcion (opcional)</li>
            <li>cantidad/stock</li>
            <li>precio_unitario</li>
            <li>cantidad_unds_vendidas</li>
            <li>orden (posición actual)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}