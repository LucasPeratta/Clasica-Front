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
import {
  Alert,
  CircularProgress,
  FormControlLabel,
  RadioGroup,
} from "@mui/material";
import Radio from "@mui/material/Radio";

const initialState: iService = {
  id: "",
  precioNeto: "",
  tarifa: "",
  currency: "",
  provider: "",
  obs: "",
  createdAt: null,
  deleted_at: null,
};

export const ServiceForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

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

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress color="primary" />
        <p style={{ marginTop: "16px" }}>Cargando...</p>
      </div>
    );
  }

  const controlProps = (item: string) => ({
    onChange: handleChange,
    value: item,
    name: "size-radio-button-demo",
    inputProps: { "aria-label": item },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    if (id === "") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ["currency"]: value,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [id]: value,
      }));
    }
  };

  const openNotification = () => {
    setNotificationOpen(true);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requiredFields = ["provider", "precioNeto", "tarifa", "currency"];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      console.log(missingFields);
      return;
    }

    const allowedCurrencies = ["USD", "PESOS", "EURO"];
    if (!allowedCurrencies.includes(formData.currency)) {
      alert("Error: El tipo de moneda no es válido.");
      return;
    }

    await handleSubmit(event);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (id) {
        const response = await updateService(id, formData);

        if (response.ok) {
          openNotification();
          setTimeout(() => {
            navigate(`/services/profile/${id}`);
          }, 1500);
        } else {
          openErrorNotification();
        }
      } else {
        const response = await createService(formData);

        if (response.ok) {
          setFormData(initialState);
          openNotification();
          setTimeout(() => {
            navigate("/services");
          }, 1500);
        } else {
          openErrorNotification();
          const errorData = await response.json();
          console.log(errorData);
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="pax-form-container">
      <h1>Crear Servicio</h1>
      <Box>
        <FormControl className="form">
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
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

              <RadioGroup
                id="currency"
                value={formData.currency}
                onChange={handleChange}
                row
              >
                <FormControlLabel
                  value="USD"
                  control={<Radio {...controlProps("USD")} />}
                  label="USD"
                />
                <FormControlLabel
                  value="PESOS"
                  control={<Radio {...controlProps("PESOS")} />}
                  label="PESOS"
                />
                <FormControlLabel
                  value="EURO"
                  control={<Radio {...controlProps("EURO")} />}
                  label="EURO"
                />
              </RadioGroup>
            </div>
            <div className="obs-field">
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
            </div>
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
          </form>
        </FormControl>
      </Box>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top", // Posición vertical en la parte superior
          horizontal: "center", // Posición horizontal a la derecha
        }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success">
          {id
            ? "Servicio actualizado correctamente"
            : "Servicio creado correctamente"}
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={5000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={() => setErrorNotificationOpen(false)} severity="error">
          Error al crear servicio
        </Alert>
      </Snackbar>
    </div>
  );
};
