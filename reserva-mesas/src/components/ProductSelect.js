import React, { useState, useEffect } from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import { getProductos } from '../services/api';

const ProductSelect = ({ onSelect }) => {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);

  useEffect(() => {
    getProductos()
      .then(response => setProductos(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const handleSelect = (event, value) => {
    setSelectedProducto(value);
    onSelect(value ? value.id : '');
  };

  return (
    <FormControl fullWidth size='small'>
      <Autocomplete
        value={selectedProducto}
        onChange={handleSelect}
        options={productos}
        getOptionLabel={(option) => option.nombre}
        renderInput={(params) => <TextField {...params} label="Seleccionar Producto" variant="outlined" size='small' />}
      />
    </FormControl>
  );
};

export default ProductSelect;
