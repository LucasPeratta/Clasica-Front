import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate, useParams } from "react-router-dom";
import { iFile } from "../../model";
import { getFileById, createFile, updateFile } from "../handler";
import Grid from "@mui/material/Grid";
import "dayjs/locale/es";
import "./styles.scss";
import dayjs from "dayjs";

const initialState: iFile = {
  id: "",
  precioNetoTotal: "",
  tarifaTotal: "",
  destino: "",
  fechaSalida: null,
  clients: [],
  services: [],
  obs: "",
};

export const FileForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      getFileById(id)
        .then((file) => {
          if (file) {
            file.fechaSalida = dayjs(file.fechaSalida);
            setFormData(file);
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

    setFormData((prevFormData) => ({
      ...prevFormData,
      [id]: value,
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //para validar errores
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validar campos requeridos
    const requiredFields = [
      "precioNetoTotal",
      "tarifaTotal",
      "destino",
      "fechaSalida",
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
      if (id) {
        // Actualización
        const response = await updateFile(id, formData);

        if (response.ok) {
          console.log("File actualizado correctamente");
          navigate(`/files/profile/${id}`);
          setSnackbarOpen(true);
        } else {
          console.log(response);
          console.log("Error al actualizar el File");
        }
      } else {
        // Creación
        const response = await createFile(formData);

        if (response.ok) {
          console.log("File creado correctamente");
          setFormData(initialState);
          navigate("/files");
          setSnackbarOpen(true);
        } else {
          console.log(response);
          const errorData = await response.json();
          console.log(errorData);
          console.log("Error al crear el File");
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
              id="destino"
              label="Destino"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.destino}
              onChange={handleChange}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DatePicker
                label="Fecha de Salida"
                value={formData.fechaSalida}
                onChange={(value) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    fechaSalida: value,
                  }));
                }}
              />
            </LocalizationProvider>
            <TextField
              id="precioNetoTotal"
              label="Precio Neto Total"
              variant="outlined"
              required
              inputProps={{ maxLength: 10 }}
              value={formData.precioNetoTotal}
              onChange={handleChange}
            />
            <TextField
              id="tarifaTotal"
              label="Tarifa Total"
              variant="outlined"
              required
              inputProps={{ maxLength: 15 }}
              value={formData.tarifaTotal}
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
                      ? () => navigate(`/files/profile/${id}`)
                      : () => navigate("/files")
                  }
                >
                  Volver
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="success">
                  {id ? "ACTUALIZAR File" : "CREAR File"}
                </Button>
              </Grid>
            </Grid>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              message="File creado correctamente"
            />
          </form>
        </FormControl>
      </Box>
    </div>
  );
};
