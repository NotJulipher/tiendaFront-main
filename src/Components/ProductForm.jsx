import { useState } from 'react';

export function ProductForm({ initial, onCreate, onUpdate, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [stock, setStock] = useState(initial?.stock || '');
  const [image, setImage] = useState(initial?.image || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      name, 
      description, 
      price: parseFloat(price), 
      stock: parseInt(stock), 
      image 
    };
    
    if (initial) {
      onUpdate(initial.id, payload);
    } else {
      onCreate(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-header">
        <h5 className="modal-title">{initial ? 'Editar' : 'Crear'} Producto</h5>
        <button type="button" className="btn-close" onClick={onCancel}></button>
      </div>
      
      <div className="modal-body">
        <div className="mb-3">
          <label className="form-label">Nombre *</label>
          <input 
            type="text" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Ej: Laptop HP"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea 
            className="form-control" 
            rows="3"
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del producto..."
          />
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Precio *</label>
            <input 
              type="number" 
              step="0.01" 
              className="form-control" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
              placeholder="0.00"
            />
          </div>
          
          <div className="col-md-6 mb-3">
            <label className="form-label">Stock *</label>
            <input 
              type="number" 
              className="form-control" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              required 
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">URL Imagen</label>
          <input 
            type="text" 
            className="form-control" 
            value={image} 
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          {image && (
            <div className="mt-2">
              <img src={image} alt="Preview" style={{maxWidth: '100px'}} />
            </div>
          )}
        </div>
      </div>
      
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}