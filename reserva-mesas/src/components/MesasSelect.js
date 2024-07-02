// src/components/TableSelect.js
import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const MesasSelect = ({ mesas, onSelect }) => {
  const [selectedTable, setSelectedTable] = React.useState('');

  const handleSelect = (event) => {
    setSelectedTable(event.target.value);
    onSelect(event.target.value);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <FormControl fullWidth>
        <InputLabel>Seleccionar Mesa</InputLabel>
        <Select
          value={selectedTable}
          onChange={handleSelect}
          label="Seleccionar Mesa"
        >
          <MenuItem value="">
            <em>Selecciona una mesa</em>
          </MenuItem>
          {mesas.map((mesa) => (
            <MenuItem key={mesa.id} value={mesa.id}>
              {mesa.nombre} (Capacidad: {mesa.capacidad})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MesasSelect;
