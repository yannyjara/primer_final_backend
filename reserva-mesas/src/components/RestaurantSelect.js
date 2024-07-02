import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from '../services/api';

const RestaurantSelect = ({ onSelect }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');

  useEffect(() => {
    axios.get('/api/restaurante')
      .then(response => setRestaurants(response.data))
      .catch(error => console.error('Error fetching restaurants:', error));
  }, []);

  const handleSelect = (event) => {
    setSelectedRestaurant(event.target.value);
    onSelect(event.target.value);
  };

  return (
    <div>
      <FormControl fullWidth variant="outlined">
        <InputLabel id="select-restaurant-label">Seleccionar Restaurante:</InputLabel>
        <Select
          labelId="select-restaurant-label"
          id="select-restaurant"
          value={selectedRestaurant}
          onChange={handleSelect}
          label="Seleccionar Restaurante"
        >
          <MenuItem value="">
            <em>Selecciona un restaurante</em>
          </MenuItem>
          {restaurants.map((restaurant) => (
            <MenuItem key={restaurant.id} value={restaurant.id}>
              {restaurant.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default RestaurantSelect;
