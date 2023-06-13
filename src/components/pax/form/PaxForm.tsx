import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate, useParams } from "react-router-dom";
import { IPax } from "../model";
import { getPaxById } from "../handler";

import "./styles.scss";

const initialState: Omit<IPax, "id"> = {
  firstname: "",
  lastname: "",
  dni: "",
  passport: "",
  dob: "",
  adress: "",
  email: "",
  PhoneNumber: "",
  obs: "",
};

export const PaxForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    console.log("ENTREEEEEEEEE");
    console.log(id);
    if (id) {
      getPaxById(id)
        .then((pax) => {
          if (pax) {
            setFormData(pax);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Cambiarlo por algo mas potable y lindo
  if (loading) return <div>Loading...</div>;

  //actualizar estado del form
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    //passport solo tendra letras en mayusculas y nums.
    if (id === "passport") {
      const formattedValue = value.toUpperCase();
      event.target.value = formattedValue;

      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: formattedValue,
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
    const requiredFields = [
      "firstname",
      "lastname",
      "dni",
      "passport",
      "dob",
      "email",
      "PhoneNumber",
    ];

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
      const response = await fetch("http://localhost:3001/api/pax/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Pasajero creado correctamente");
        setFormData(initialState);
        navigate("/paxs");
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
              id="firstname"
              label="Nombre"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.firstname}
              onChange={handleChange}
            />
            <TextField
              id="lastname"
              label="Apellido"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.lastname}
              onChange={handleChange}
            />
            <TextField
              id="dni"
              label="DNI"
              variant="outlined"
              required
              inputProps={{ maxLength: 10 }}
              value={formData.dni}
              onChange={handleChange}
            />
            <TextField
              id="passport"
              label="Nro Passaporte"
              variant="outlined"
              required
              inputProps={{ maxLength: 7 }}
              value={formData.passport}
              onChange={handleChange}
            />

            <TextField
              id="dob"
              label="Fecha de Nacimiento"
              variant="outlined"
              required
              inputProps={{ maxLength: 35 }}
              value={formData.dob}
              onChange={handleChange}
            />

            <TextField
              id="adress"
              label="Direccion"
              variant="outlined"
              required
              inputProps={{ maxLength: 20 }}
              value={formData.adress}
              onChange={handleChange}
            />

            <TextField
              id="email"
              label="Email"
              variant="outlined"
              required
              inputProps={{ maxLength: 35 }}
              value={formData.email}
              onChange={handleChange}
            />

            <TextField
              id="PhoneNumber"
              label="Nro de celular"
              variant="outlined"
              required
              inputProps={{ maxLength: 35 }}
              value={formData.PhoneNumber}
              onChange={handleChange}
            />

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
