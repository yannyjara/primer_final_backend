// src/components/ReservationsTable.js
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ReservationsTable = ({ reservations }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Restaurante</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Hora</TableCell>
            <TableCell>Mesa</TableCell>
            <TableCell>Cliente</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.nombreRestaurante}</TableCell>
              <TableCell>{reservation.fecha}</TableCell>
              <TableCell>{reservation.rangoHora}</TableCell>
              <TableCell>{reservation.nombreMesa}</TableCell>
              <TableCell>{`${reservation.nombreCliente} ${reservation.apellidoCliente}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReservationsTable;
