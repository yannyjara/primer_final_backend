// src/components/TableSelect.js
import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import { Box, FormControl, InputLabel, MenuItem, Select, Alert } from '@mui/material';

const TableSelect = ({ restaurantId, selectedDate, selectedRanges, onSelect }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [noTablesMessage, setNoTablesMessage] = useState('');

  useEffect(() => {
    if (restaurantId && selectedDate && selectedRanges.length > 0) {
      axios.post('/api/reserva/mesasDis', {
        restauranteId: restaurantId,
        fecha: selectedDate,
        rangoHora: selectedRanges
      })
      .then(response => {
        if (response.data.length == 0) {
          setNoTablesMessage('No hay mesas disponibles en el horario seleccionado.');
          setTables([]);
        } else {
          setNoTablesMessage('');
          setTables(response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching tables:', error);
        setNoTablesMessage('Error al buscar mesas disponibles. Por favor, inténtelo de nuevo más tarde.');
      });
    }
  }, [restaurantId, selectedDate, selectedRanges]);

  const handleSelect = (event) => {
    setSelectedTable(event.target.value);
    onSelect(event.target.value);
  };

  return (
    <Box sx={{ mt: 2 }}>
      {noTablesMessage && <Alert severity="warning">{noTablesMessage}</Alert>}
      <FormControl fullWidth>
        <InputLabel>Seleccionar Mesa</InputLabel>
        <Select
          value={selectedTable}
          onChange={handleSelect}
          label="Seleccionar Mesa"
          disabled={tables.length == 0}
        >
          <MenuItem value="">
            <em>Selecciona una mesa</em>
          </MenuItem>
          {tables.map((table) => (
            <MenuItem key={table.id} value={table.id}>
              {table.nombre} (Capacidad: {table.capacidad})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TableSelect;
