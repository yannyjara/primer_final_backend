import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import ReservationForm from './components/ReservationForm';
import ReservationsList from './components/ReservationsList';
import ConsumoForm from './components/ConsumoForm';

const App = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Reservas
          </Typography>
          <Button color="inherit" component={Link} to="/reservar">
            Crear Reserva
          </Button>
          <Button color="inherit" component={Link} to="/reservas">
            Lista de Reservas
          </Button>
          <Button color="inherit" component={Link} to="/consumo">
            Consumo
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/reservar" element={<ReservationForm />} />
          <Route path="/reservas" element={<ReservationsList />} />
          <Route path="/consumo" element={<ConsumoForm />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
