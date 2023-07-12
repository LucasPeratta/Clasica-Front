import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate, useParams } from "react-router-dom";
import { iService } from "../../model";
import { getServiceById, createService, updateService } from "../handler";
import Grid from "@mui/material/Grid";
import "dayjs/locale/es";
import "./styles.scss";

const initialState: iService = {
  id: "",
  precioNeto: "",
  tarifa: "",
  currency: "",
  provider: "",
  obs: "",
};

export const ServiceForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      getServiceById(id)
        .then((service) => {
          if (service) {
            setFormData(service);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [id]);

  // Cambiarlo por algo mas potable y lindo
  if (loading) return <div>Loading...</div>;

  //actualizar estado del form
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    if (id === "currency") {
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
    const requiredFields = ["provider", "precioNeto", "tarifa", "currency"];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      console.log(missingFields);
      console.log("Error: Debes completar todos los campos requeridos.");
      return;
    }

    // Validar valor de currency
    const allowedCurrencies = ["USD", "PESOS", "EURO"];
    if (!allowedCurrencies.includes(formData.currency)) {
      alert("Error: El tipo de moneda no es válido.");
      return;
    }

    // Si todos los campos requeridos están completos pasamos la verificacion y vamos a la sig funcion a hacer la petision.
    await handleSubmit(event);
  };

  //funcion que se llamara cdo se apreta el bton crear y no hay ningun error
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (id) {
        // Actualización
        const response = await updateService(id, formData);

        if (response.ok) {
          console.log("Servicio actualizado correctamente");
          navigate(`/services/profile/${id}`);
          setSnackbarOpen(true);
        } else {
          console.log(response);
          console.log("Error al actualizar el Servicio");
        }
      } else {
        // Creación
        const response = await createService(formData);

        if (response.ok) {
          console.log("Servicio creado correctamente");
          setFormData(initialState);
          navigate("/services");
          setSnackbarOpen(true);
        } else {
          console.log(response);
          const errorData = await response.json();
          console.log(errorData);
          console.log("Error al crear el Servicio");
        }
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
              label="Proveedor"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.provider}
              onChange={handleChange}
            />
            <TextField
              id="precioNeto"
              label="Precio Neto"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.precioNeto}
              onChange={handleChange}
            />
            <TextField
              id="tarifa"
              label="Tarifa"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.tarifa}
              onChange={handleChange}
            />
            <TextField
              id="currency"
              label="Tipo de Moneda"
              variant="outlined"
              required
              inputProps={{ maxLength: 10 }}
              value={formData.currency}
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
            <Grid container spacing={2} justifyContent="space-between">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={
                    id
                      ? () => navigate(`/services/profile/${id}`)
                      : () => navigate("/services")
                  }
                >
                  Volver
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="success">
                  {id ? "ACTUALIZAR Servicio" : "CREAR Servicio"}
                </Button>
              </Grid>
            </Grid>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              message="Servicio creado correctamente"
            />
          </form>
        </FormControl>
      </Box>
    </div>
  );
};
