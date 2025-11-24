import { useEffect } from 'react';

export function ProductCard({ product, onSelect, onEdit, onDelete }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="bg-light d-flex justify-content-center align-items-center" style={{ height: 150 }}>
        {product.image ? <img src={product.image} alt="img" className="img-fluid" /> : <small className="text-muted">Sin imagen</small>}
      </div>
      <div className="card-body">
        <h6 className="fw-bold text-truncate">{product.name}</h6>
        <p className="text-muted small text-truncate">{product.description}</p>

        <div className="d-flex justify-content-between mt-2">
          <div><small className="text-muted">Precio</small><div className="fw-bold">${product.price}</div></div>
          <div className="text-end"><small className="text-muted">Stock</small><div className="fw-bold">{product.stock}</div></div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-outline-primary btn-sm w-100" onClick={onSelect}>Ver</button>
          <button className="btn btn-outline-warning btn-sm" onClick={onEdit}>✏️</button>
          <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>🗑️</button>
        </div>
      </div>
    </div>
  );
}


export function Modal({ children, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}