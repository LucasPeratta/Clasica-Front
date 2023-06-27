import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import "./CreateService.scss";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";

const initialState = {
  provider: "",
  neto: "",
  currency: "pesos",
  obs: "",
};

export const CreateService = () => {
  const [formData, setFormData] = useState(initialState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  //actualizar estado del form
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    if (id === "currency") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: value,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: value,
      }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //para validar errores
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validar campos requeridos
    const requiredFields = ["provider", "neto", "currency"];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      console.log(missingFields);
      console.log("Error: Debes completar todos los campos requeridos.");
      return;
    }

    // Si todos los campos requeridos están completos pasamos la verificacion y vamos a la sig funcion a hacer la petision.
    await handleSubmit(event);
  };

  //funcion que se llamara cdo se apreta el bton crear y no hay ningun error
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/service/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Servicio creado correctamente");
        setFormData(initialState);
        navigate("/service");
        setSnackbarOpen(true);
      } else {
        console.log("Error al crear el pasajero");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="form-container">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "20px",
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <FormControl>
          <form onSubmit={handleFormSubmit}>
            <TextField
              id="provider"
              label="Nombre Provedor"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.provider}
              onChange={handleChange}
            />
            <TextField
              id="neto"
              label="Precio Neto"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.neto}
              onChange={handleChange}
            />

            <RadioGroup
              id="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <FormControlLabel
                value="PESOS"
                control={<Radio />}
                label="Pesos"
              />
              <FormControlLabel value="USD" control={<Radio />} label="USD" />
              <FormControlLabel value="EURO" control={<Radio />} label="Euro" />
            </RadioGroup>

            <TextField
              id="obs"
              label="Observaciones"
              multiline
              inputProps={{ maxLength: 200 }}
              rows={5}
              variant="outlined"
              value={formData.obs}
              onChange={handleChange}
            />
            <Button type="submit" variant="contained" color="success">
              Crear Pasajero
            </Button>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              message="Pasajero creado correctamente"
            />
          </form>
        </FormControl>
      </Box>
    </div>
  );
};
