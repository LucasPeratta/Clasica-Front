import { Button, Grid } from "@mui/material";
import { Autocomplete, IOptions } from "../../common/Autocomplete/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useEffect, useState } from "react";
import { iPax, iService } from "../../model";
import { getPax } from "../../Pax/handler";
import { getService } from "../../Service/handler";
import { useNavigate, useParams } from "react-router-dom";
import { iFile } from "../../model";
import { getFileById, createFile, updateFile } from "../handler";
import "dayjs/locale/es";
import "./fileForm.scss";
import dayjs from "dayjs";

const initialState: iFile = {
  id: "",
  precioNetoTotal: "0",
  tarifaTotal: "0",
  destino: "",
  fechaSalida: null,
  clients: [],
  services: [],
  obs: "",
};

export const FileForm = () => {
  const [paxs, setPaxs] = useState<iPax[]>([]);
  const [selectedPax, setSelectedPax] = useState<IOptions[]>([]);
  const [services, setServices] = useState<iService[]>([]);
  const [selectedService, setSelectedService] = useState<IOptions[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    getPax()
      .then((pax) => {
        setPaxs(pax);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    getService()
      .then((service) => {
        setServices(service);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

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

  const optionsPax = paxs.map((p) => {
    return {
      id: p.id,
      title: `${p.firstname} ${p.lastname}`,
    };
  });

  const initialSelectedPax = formData.clients.map((pax) => {
    return {
      id: pax.id,
      title: ` ${pax.firstname} ${pax.lastname}`,
    };
  });

  const initialSelectedService = formData.services.map((service) => {
    return {
      id: service.id,
      title: ` ${service.provider} ${service.tarifa}  ${service.currency}`,
    };
  });

  const optionsService = services.map((p) => {
    return {
      id: p.id,
      title: `${p.provider} | ${p.tarifa}`,
    };
  });

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
  const validate = () => {
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
      return false;
    }
    return true;
  };

  const createDataFile = async () => {
    const paxsId: string[] = selectedPax.map((pax) => pax.id);
    const servicesId: string[] = selectedService.map((service) => service.id);
    const response = await createFile(formData, paxsId, servicesId);
    if (response.ok) return true;
    return false;
  };

  const updateData = async (idFile: string) => {
    const paxsId: string[] = selectedPax.map((service) => service.id);
    const servicesId: string[] = selectedService.map((service) => service.id);
    const response = await updateFile(idFile, formData, paxsId, servicesId);
    if (response.ok) return true;
    return false;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      alert("Error: Debes completar todos los campos requeriosd(*)");
      return;
    }
    try {
      if (id) {
        // Actualización

        if (await updateData(id)) {
          console.log("File actualizado correctamente");
          navigate(`/files/profile/${id}`);
          setSnackbarOpen(true);
        } else {
          console.log("Error al actualizar el File");
        }
      } else {
        // Creación

        const response = await createDataFile();
        if (response) {
          console.log("File creado correctamente");
          setFormData(initialState);
          navigate("/files");
          setSnackbarOpen(true);
        } else {
          console.log("Error al crear el File");
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="main-container">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <>
            <h3>Datos del File:</h3>

            <div className="form-container">
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  padding: "20px",
                  border: "2px solid #ccc",
                  borderRadius: "15px",
                }}
              >
                <FormControl>
                  <form>
                    <TextField
                      id="destino"
                      label="Destino"
                      variant="outlined"
                      required
                      inputProps={{ maxLength: 15 }}
                      value={formData.destino}
                      onChange={handleChange}
                    />
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale="es"
                    >
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
                      inputProps={{ maxLength: 15 }}
                      value={formData.precioNetoTotal}
                      disabled // Campo deshabilitado
                    />
                    <TextField
                      id="tarifaTotal"
                      label="Tarifa Total"
                      variant="outlined"
                      inputProps={{ maxLength: 15 }}
                      value={formData.tarifaTotal}
                      disabled // Campo deshabilitado
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
          </>
        </Grid>
        <Grid item xs={6}>
          <Grid
            container
            spacing={2}
            direction="column"
            justifyContent="center"
          >
            <Grid item>
              {/* Middle part: Autocomplete for Pax */}
              <Autocomplete
                initialValues={initialSelectedPax}
                options={optionsPax}
                label="Agregar Pasajeros"
                updateSelection={setSelectedPax}
              />
            </Grid>
            <Grid item sx={{ marginTop: "auto" }}>
              {/* Bottom part: Autocomplete for Services */}
              <Autocomplete
                initialValues={initialSelectedService}
                options={optionsService}
                label="Agregar Servicios"
                updateSelection={setSelectedService}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="center">
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
          <Button
            type="submit"
            variant="contained"
            color="success"
            onClick={handleSubmit}
          >
            {id ? "ACTUALIZAR FILE" : "CREAR FILE"}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
