import React from 'react';
import { TextField } from '@mui/material';

const DateSelect = ({ onSelect }) => {
  const handleDateChange = (event) => {
    onSelect(event.target.value);
  };

  return (
    <div>
      <TextField
        id="date-picker"
        label="Seleccionar Fecha"
        type="date"
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </div>
  );
};

export default DateSelect;
