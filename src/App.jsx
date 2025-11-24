import { useEffect, useState } from 'react'
import './App.css'
import { Modal, ProductCard } from './Components/ProductCard'


const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8) // genera un ID simple
const STORAGE_KEY = 'cart_items' // clave para el almacenamiento local

const SEED_PRODUCTS = [ // productos de ejemplo (Borrarlos cuando se conecte a un backend pliss)
  { id: 'prod1', name: 'Producto 1', price: 10.0 },
  { id: 'prod2', name: 'Producto 2', price: 15.5 },
  { id: 'prod3', name: 'Producto 3', price: 7.25 },
]

export default function App() {
  //variables
  const [products, setProducts] = useState([]) // lista de productos
  const [query, setQuery] = useState('') // consulta de búsqueda
  const [selected, setSelected] = useState(null) // producto seleccionado
  const [editing, setEditing] = useState(null) // producto editado
  const [showForm, setShowForm] = useState(false) // mostrar/ocultar formulario

  //Evento para ejecutar la conversión de string a JSON
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)// leer de localStorage
    if (raw) {
      try {
        setProducts(JSON.parse(raw)) // intentar parsear JSON del backEnd
      } catch (e){
        setProducts(SEED_PRODUCTS) // si falla, usar productos de ejemplo
      }
    } else { //temporal en desarrollo
      setProducts(SEED_PRODUCTS) // si no hay productos, usar productos de ejemplo
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS)) // guardar productos de ejemplo en localStorage
    }
  },[])

  //Metodo para guardar productos en el localStorage
  const saveProducts = (next) => {
    setProducts(next) // actualizar estado
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) // guardar en localStorage
  }

  //Metodo para crear un nuevo producto
  const handleCreate = (Payload) => {
    const p = { ...Payload, id: uid() } // crear producto
    saveProducts([...products, p]) // guardar producto
    setShowForm(false) // cerrar formulario
  }

  //Metodo para editar un producto
  const handleUpdate = (id, Payload) => {
    const next = products.map((p) => (p.id === id ? { ...p, ...Payload } : p)) // actualizar producto
    saveProducts(next) // guardar producto
    setEditing(null) // cerrar formulario
    setShowForm(false) // cerrar formulario en forma de contingencia
  }

  //Metodo para eliminar un producto
  const handleDelete = (id) => {
    if(!confirm('¿Está seguro de que desea eliminar este producto?')) return // confirmar eliminación
    const next = products.filter((p) => p.id !== id) // eliminar producto
    saveProducts(next) // guardar producto
    if (selected?.id === id) setSelected(null) // deseleccionar si es el seleccionado
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())) // filtrar productos


  return (
    <div className="container py-4">
      <header className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fw-bold">Productos — CRUD</h1>
            <p className="text-muted">Frontend con React + Bootstrap</p>
          </div>


          <div className="d-flex gap-2">
            <input className="form-control" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>+ Nuevo</button>
          </div>
        </div>
      </header>


      <div className="row g-4">
      {/* LISTA */}
      <div className="col-lg-9">
        <div className="row g-3">
          {filtered.length === 0 ? (
          <div className="text-center text-muted">No hay productos</div>
          ) : (
            filtered.map((p) => (
            <div className="col-12 col-sm-6 col-md-4" key={p.id}>
            <ProductCard product={p} onSelect={() => setSelected(p)} onEdit={() => { setEditing(p); setShowForm(true) }} onDelete={() => handleDelete(p.id)} />
            </div>
          ))
          )}
        </div>
      </div>


      {/* ASIDE */}
      <div className="col-lg-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="fw-bold">Detalle del producto</h5>

            {!selected ? (
            <p className="text-muted mt-3">Selecciona un producto</p>
            ) : (
            <div className="mt-3">
              <h6 className="fw-bold">{selected.name}</h6>
              <p className="text-muted">{selected.description}</p>
              <div className="d-flex justify-content-between mt-3">
                <div><small className="text-muted">Precio</small><div className="fw-bold">${selected.price}</div></div>
                <div><small className="text-muted">Stock</small><div className="fw-bold">{selected.stock}</div></div>
              </div>


              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-warning btn-sm" onClick={() => { setEditing(selected); setShowForm(true) }}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>Eliminar</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
            )}


            <hr className="my-4" />
            <small className="text-muted">Total productos: {products.length}</small><br />
            <small className="text-muted">Filtrados: {filtered.length}</small>
          </div>
        </div>
      </div>
    </div>


    {/* MODAL */}
    {showForm && (
    <Modal onClose={() => { setShowForm(false); setEditing(null) }}>
    <ProductForm initial={editing} onCreate={handleCreate} onUpdate={handleUpdate} onCancel={() => { setShowForm(false); setEditing(null) }} />
    </Modal>
    )}
    </div>
)
}
