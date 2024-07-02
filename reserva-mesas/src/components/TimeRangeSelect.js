import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, OutlinedInput, Chip, Box } from '@mui/material';

const TimeRangeSelect = ({ selectedRanges, onSelect }) => {
  const timeRanges = [
    '12:00-13:00', '13:00-14:00', '14:00-15:00',
    '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00'
  ];

  const handleRangeChange = (event) => {
    const selectedOptions = event.target.value;
    if (Array.isArray(selectedOptions)) {
      onSelect(selectedOptions);
    } else {
      console.error("Expected selectedOptions to be an array:", selectedOptions);
    }
  };

  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel id="time-range-select-label">Seleccionar Rango de Horas</InputLabel>
      <Select
        labelId="time-range-select-label"
        id="time-range-select"
        multiple
        value={Array.isArray(selectedRanges) ? selectedRanges : []} // Verifica que selectedRanges sea un array
        onChange={handleRangeChange}
        input={<OutlinedInput id="select-multiple-chip" label="Seleccionar Rango de Horas" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {timeRanges.map((range, index) => (
          <MenuItem key={index} value={range}>
            {range}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TimeRangeSelect;
