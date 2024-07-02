import React, { useState, useEffect } from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import axios from '../services/api';

const ClientSelect = ({ onSelect }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    axios.get('/api/cliente') // Endpoint para obtener lista de clientes
      .then(response => setClients(response.data))
      .catch(error => console.error('Error fetching clients:', error));
  }, []);

  const handleSelect = (event, value) => {
    setSelectedClient(value);
    onSelect(value ? value.cedula : '');
  };

  return (
    <FormControl fullWidth>
      <Autocomplete
        value={selectedClient}
        onChange={handleSelect}
        options={clients}
        getOptionLabel={(option) => `${option.cedula} - ${option.nombre} ${option.apellido}`}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Seleccionar Cliente"
            variant="outlined"
            size="small"
          />
        )}
      />
    </FormControl>
  );
};

export default ClientSelect;
