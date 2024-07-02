import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import axios from '../services/api';
import RestaurantSelect from './RestaurantSelect';
import DateSelect from './DateSelect';
import ClientSelect from './ClientSelect';
import ReservationsTable from './ReservationsTable';

const ReservationsList = () => {
    const [restaurantId, setRestaurantId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [clientCedula, setClientCedula] = useState('');
    const [reservations, setReservations] = useState([]);

    const handleRestaurantSelect = (id) => setRestaurantId(id);
    const handleDateSelect = (date) => setSelectedDate(date);
    const handleClientSelect = (cedula) => setClientCedula(cedula);

    const fetchReservations = () => {
        const payload = {
            restauranteId: restaurantId,
            fecha: selectedDate,
            clienteCedula: clientCedula
        };

        axios.post('/api/reserva/filtro-completo', payload)
            .then(response => setReservations(response.data))
            .catch(error => console.error('Error fetching reservations:', error));
    };

    useEffect(() => {
        if (restaurantId && selectedDate) {
            fetchReservations();
        }
    }, [restaurantId, selectedDate, clientCedula]);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Lista de Reservas</Typography>
            <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <RestaurantSelect onSelect={handleRestaurantSelect} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <DateSelect onSelect={handleDateSelect} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <ClientSelect onSelect={handleClientSelect} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={fetchReservations}
                            fullWidth
                        >
                            Filtrar Reservas
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 4 }}>
                <ReservationsTable reservations={reservations} />
            </Box>
        </Container>
    );
};

export default ReservationsList;
