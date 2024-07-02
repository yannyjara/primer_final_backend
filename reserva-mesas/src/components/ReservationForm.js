import React, { useState } from 'react';
import { Button, TextField, Grid, Box, Alert } from '@mui/material';
import RestaurantSelect from './RestaurantSelect';
import DateSelect from './DateSelect';
import TimeRangeSelect from './TimeRangeSelect';
import TableSelect from './TableSelect';
import axios from '../services/api';

const ReservationForm = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRanges, setSelectedRanges] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [clienteCedula, setClienteCedula] = useState('');
  const [cantidadSolicitada, setCantidadSolicitada] = useState(1);
  const [errorMessage, setErrorMessage] = useState(''); // Estado para el mensaje de error

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.post('/api/reserva', {
      restauranteId: selectedRestaurant,
      mesaId: selectedTable,
      fecha: selectedDate,
      rangoHora: selectedRanges,
      clienteCedula: clienteCedula,
      cantidadSolicitada: cantidadSolicitada
    })
    .then(response => {
      alert('Reserva creada exitosamente');
      setErrorMessage(''); // Limpiar el mensaje de error si la reserva es exitosa
    })
    .catch(error => {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error al crear reserva');
      }
    });
  };

  const handleRestaurantSelect = (restaurantId) => setSelectedRestaurant(restaurantId);
  const handleDateSelect = (date) => setSelectedDate(date);
  const handleTimeRangeSelect = (ranges) => {
    if (Array.isArray(ranges)) {
      setSelectedRanges(ranges);
    } else {
      console.error("Expected ranges to be an array:", ranges);
    }
  };
  const handleTableSelect = (tableId) => setSelectedTable(tableId);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <RestaurantSelect onSelect={handleRestaurantSelect} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DateSelect onSelect={handleDateSelect} />
        </Grid>
        <Grid item xs={12}>
          <TimeRangeSelect selectedRanges={selectedRanges} onSelect={handleTimeRangeSelect} />
        </Grid>
        <Grid item xs={12}>
          <TableSelect
            restaurantId={selectedRestaurant}
            selectedDate={selectedDate}
            selectedRanges={selectedRanges}
            onSelect={handleTableSelect}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Cédula del Cliente"
            value={clienteCedula}
            onChange={(e) => setClienteCedula(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Cantidad Solicitada"
            type="number"
            value={cantidadSolicitada}
            onChange={(e) => setCantidadSolicitada(e.target.value)}
            required
            fullWidth
          />
        </Grid>
        {errorMessage && (
          <Grid item xs={12}>
            <Alert severity="error">{errorMessage}</Alert>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box textAlign="center">
            <Button type="submit" variant="contained" color="primary">
              Crear Reserva
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ReservationForm;
