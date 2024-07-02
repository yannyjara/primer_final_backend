// src/services/api.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:9090',  // Ajusta el puerto según corresponda
});

// Interceptor para manejar errores
instance.interceptors.response.use(
    response => response,
    error => {
      // Captura el mensaje de error del backend si está disponible
      const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado';
      return Promise.reject({ ...error, message: errorMessage });
    }
  );

export default instance;

export const getConsumo = (mesaId) => instance.post('/api/consumo/obtener2', { mesaId });
export const addDetalle = (detalle) => instance.post('/api/detalleC', detalle);
export const closeConsumo = (id) => instance.put(`/api/consumo/cerrar/${id}`);
export const changeCliente = (id, clienteConsumoCedula) => instance.put(`/api/consumo/cambiarCliente/${id}`, { clienteConsumoCedula });
export const createConsumo = (consumoData) => instance.post('/api/consumo/crear', consumoData); // Agrega esta línea
export const getMesas = (restaurantId) => instance.get(`/api/mesa/restaurante/${restaurantId}`);
export const createCliente = (clienteData) => instance.post('/api/cliente', clienteData);
export const getProductos = () => instance.get('/api/productos');

