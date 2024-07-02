// src/components/ConsumoForm.js
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Modal, Paper, FormControl, InputLabel, MenuItem, Select, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getConsumo, addDetalle, closeConsumo, changeCliente, createConsumo, getMesas, createCliente } from '../services/api';
import RestaurantSelect from './RestaurantSelect';
import MesasSelect from './MesasSelect';
import ClientSelect from './ClientSelect';
import ProductSelect from './ProductSelect';

const ConsumoForm = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mesas, setMesas] = useState([]);
  const [consumo, setConsumo] = useState(null);
  const [newDetalle, setNewDetalle] = useState({ productoId: '', cantidad: '' });
  const [newCliente, setNewCliente] = useState('');
  const [isTableOccupied, setIsTableOccupied] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newClientData, setNewClientData] = useState({ cedula: '', nombre: '', apellido: '' });
  const [alertMessage, setAlertMessage] = useState({ message: '', severity: '' });
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      getMesas(selectedRestaurant)
        .then(response => setMesas(response.data))
        .catch(error => console.error('Error fetching tables:', error));
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (selectedTable) {
      getConsumo(selectedTable)
        .then(response => {
          if (response.data) {
            setConsumo(response.data);
            setIsTableOccupied(true);
          } else {
            setConsumo(null);
            setIsTableOccupied(false);
          }
        })
        .catch(() => {
          setConsumo(null);
          setIsTableOccupied(false);
        });
    }
  }, [selectedTable]);

  const handleAddDetalle = (consumoCabeceraId) => {
    addDetalle({ ...newDetalle, consumoCabeceraId })
      .then(() => {
        getConsumo(selectedTable) // Volver a obtener los datos del consumo después de agregar el detalle
          .then(response => {
            if (response.data) {
              setConsumo(response.data);
            }
          })
          .catch(error => setAlertMessage({ message: 'Error obteniendo consumo: ' + error.message, severity: 'error' }));
      })
      .catch(error => setAlertMessage({ message: 'Error agregando detalle: ' + error.message, severity: 'error' }));
  };

  const handleCreateConsumo = () => {
    createConsumo({
      mesaId: selectedTable,
      restauranteConsumoId: selectedRestaurant,
      clienteConsumoCedula: newCliente,
    })
      .then(response => {
        const consumoData = response.data;
        setConsumo(consumoData);
        handleAddDetalle(consumoData.id);
        getConsumo(selectedTable) // Volver a obtener los datos del consumo después de agregar el detalle
          .then(response => {
            if (response.data) {
              setConsumo(response.data);
            }
          })
          .catch(error => setAlertMessage({ message: 'Error obteniendo consumo: ' + error.message, severity: 'error' }));
        setAlertMessage({ message: 'Consumo creado correctamente', severity: 'success' });
      })
      .catch(error => setAlertMessage({ message: 'Error creando consumo: ' + error.message, severity: 'error' }));

  };

  const handleCloseConsumo = () => {
    if (consumo) {
      closeConsumo(consumo.cabecera.id)
        .then(response => {
          console.log('Consumo cerrado:', response.data);
          setAlertMessage({ message: 'Consumo cerrado correctamente', severity: 'success' });
          setPdfData(response.data.pdf); // Guardar el PDF en el estado
        })
        .catch(error => setAlertMessage({ message: 'Error cerrando consumo: ' + error.message, severity: 'error' }));

    }
  };

  const handleChangeCliente = () => {
    if (consumo) {
      changeCliente(consumo.cabecera.id, newCliente)
        .then(() => {
          getConsumo(selectedTable) // Volver a obtener los datos del consumo después de agregar el detalle
          .then(response => {
            if (response.data) {
              setConsumo(response.data);
            }
          })
          .catch(error => setAlertMessage({ message: 'Error obteniendo consumo: ' + error.message, severity: 'error' }));
          setAlertMessage({ message: 'Cliente cambiado correctamente', severity: 'success' });
          
        })
        .catch(error => setAlertMessage({ message: 'Error cambiando cliente: ' + error.message, severity: 'error' }));
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleCreateCliente = () => {
    createCliente(newClientData)
      .then(response => {
        setNewCliente(newClientData.cedula); // Set the new client as the selected client
        handleCloseModal();
        setAlertMessage({ message: 'Cliente creado con exito', severity: 'success' });

      })
      .catch(error => setAlertMessage({ message: 'Error creando cliente: ' + error.message, severity: 'error' }));
  };

  return (
    <Box >
      {alertMessage.message && (
        <Alert marginBottom="10px;" severity={alertMessage.severity} onClose={() => setAlertMessage({ message: '', severity: '' })}>
          {alertMessage.message}
        </Alert>
      )}
      <Grid container spacing={2} alignItems="flex-end" justifyContent="center" marginBottom="20px">
        <Grid item xs={12} sm={6}>
          <RestaurantSelect onSelect={setSelectedRestaurant} />
        </Grid>
        {selectedRestaurant && (
          <Grid item xs={12} sm={6}>
            <MesasSelect mesas={mesas} onSelect={setSelectedTable} />
          </Grid>
        )}
      </Grid>
      {!selectedTable ? (
        <Alert marginTop="10px;" severity="info">Seleccione una mesa para ver o agregar consumos.</Alert>
      ) : !isTableOccupied ? (
        <>
          <Typography variant="h3">Nuevo Consumo</Typography>
          <Typography variant="h5">Mesa: {selectedTable}</Typography>
          
          <ClientSelect onSelect={setNewCliente} />
          <Button onClick={handleChangeCliente}>Cambiar Cliente</Button>
          <Button onClick={handleOpenModal}>Crear Nuevo Cliente</Button>

          <Typography variant="h6">Agregar Detalles</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ProductSelect onSelect={(productoId) => setNewDetalle({ ...newDetalle, productoId })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantidad"
                value={newDetalle.cantidad}
                onChange={e => setNewDetalle({ ...newDetalle, cantidad: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button onClick={handleCreateConsumo}>Crear Consumo y Agregar Detalle</Button>
        </>
      ) : (
        <>
          <Typography variant="h4" marginBottom={"20px"} alignItems={'center'} textAlign={'center'}>Consumo Actual</Typography>
          <Grid container spacing={2} marginBottom={"20px"}> 
            <Grid item xs={12} sm={2}>
              <Typography variant="h5">Mesa: {selectedTable}</Typography>
            </Grid>
            <Grid item xs={12} sm={7}>
              <Typography variant="h5">Cliente: {`${consumo.cabecera.clienteConsumoCedula} - ${consumo.cabecera.nombrecliente}`}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h5">Total: {`Gs. ${parseFloat(consumo.cabecera.total).toLocaleString('es-PY')}`}</Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <ClientSelect onSelect={setNewCliente} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ProductSelect onSelect={(productoId) => setNewDetalle({ ...newDetalle, productoId })} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Cantidad"
                value={newDetalle.cantidad}
                onChange={e => setNewDetalle({ ...newDetalle, cantidad: e.target.value })}
                fullWidth size='small'
              />
            </Grid>
          </Grid>
          <Button onClick={handleChangeCliente}>Cambiar Cliente</Button>
          <Button onClick={handleOpenModal}>Crear Nuevo Cliente</Button>
          <Button onClick={() => handleAddDetalle(consumo.cabecera.id)}>Agregar Detalle</Button>

          <Typography variant="h6" textAlign={'center'} marginBottom={"10px"}>Detalles</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Costo Unitario</TableCell>
                  <TableCell>Costo Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumo.detalles.map(detalle => (
                  <TableRow key={detalle.productoId}>
                    <TableCell>{detalle.productonombre}</TableCell>
                    <TableCell>{detalle.cantidad}</TableCell>
                    <TableCell>{parseFloat(detalle.precio).toLocaleString("es-PY")}</TableCell>
                    <TableCell>{parseFloat(detalle.cantidad * detalle.precio).toLocaleString("es-PY")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          
          <Button onClick={handleCloseConsumo}>Cerrar Consumo</Button>
          {pdfData && (
            <iframe
              src={`data:application/pdf;base64,${pdfData}`}
              title="Consumo PDF"
              width="100%"
              height="500px"
              style={{ marginTop: '20px' }}
            />
          )}
        </>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper style={{ padding: '20px', margin: '20px' }}>
          <Typography variant="h6">Agregar Nuevo Cliente</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                label="Cédula"
                value={newClientData.cedula}
                onChange={e => setNewClientData({ ...newClientData, cedula: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                value={newClientData.nombre}
                onChange={e => setNewClientData({ ...newClientData, nombre: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellido"
                value={newClientData.apellido}
                onChange={e => setNewClientData({ ...newClientData, apellido: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          <Button onClick={handleCreateCliente}>Crear Cliente</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default ConsumoForm;
