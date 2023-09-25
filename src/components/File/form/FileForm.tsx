import { Alert, Button, Grid, Snackbar } from "@mui/material";
import { Autocomplete, IOptions } from "../../common/Autocomplete/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
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
import { LoadingScreen } from "../../LoadingScreen";

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
  const { id } = useParams<{ id?: string }>();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  useEffect(() => {
    const promises = [getPax(), getService()];

    if (id) {
      promises.push(getFileById(id));
    }

    Promise.allSettled(promises)
      .then((results) => {
        let paxsData: iPax[] = [];
        let serviceData: iService[] = [];
        let fileData: iFile | undefined;

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            //verifica si el esatdo de la promesa esta resuelta
            if (Array.isArray(result.value)) {
              if (result.value.length > 0) {
                // para ver si corresponde a sreive o paxs
                if ("provider" in result.value[0]) {
                  serviceData = result.value as iService[];
                } else {
                  paxsData = result.value as iPax[];
                }
              }
            } else {
              if (id) {
                fileData = result.value as iFile;
              }
            }
          }
        });

        if (paxsData.length > 0) {
          setPaxs(paxsData);
        }

        if (serviceData.length > 0) {
          const sortedService = serviceData.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return dayjs(a.createdAt).isBefore(b.createdAt) ? 1 : -1;
            }
            return 0;
          });
          setServices(sortedService);
        }

        if (fileData) {
          fileData.fechaSalida = dayjs(fileData.fechaSalida);
          setFormData(fileData);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

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

  const openNotification = () => {
    setNotificationOpen(true);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  const createDataFile = async () => {
    const paxsId: string[] = selectedPax.map((pax) => pax.id);
    const servicesId: string[] = selectedService.map((service) => service.id);
    const response = await createFile(formData, paxsId, servicesId);
    if (response.ok) {
      return true;
    }
    return false;
  };

  const updateData = async (idFile: string) => {
    const paxsId: string[] = selectedPax.map((service) => service.id);
    const servicesId: string[] = selectedService.map((service) => service.id);
    const response = await updateFile(idFile, formData, paxsId, servicesId);
    if (response.ok) {
      return true;
    }
    return false;
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
      console.error(missingFields);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      openErrorNotification();
      return;
    }
    try {
      if (id) {
        // Actualización

        if (await updateData(id)) {
          openNotification();
          setTimeout(() => {
            navigate(`/files/profile/${id}`);
          }, 1500);
        } else {
          console.error("Error al actualizar el File");
        }
      } else {
        // Creación
        const response = await createDataFile();
        if (response) {
          setFormData(initialState);
          openNotification();
          setTimeout(() => {
            navigate("/files");
          }, 1500);
        } else {
          console.error("Error al crear el File");
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="main-container">
      <h1>Crear File:</h1>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <>
            <h3>-Datos del File</h3>

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
              <Autocomplete
                initialValues={initialSelectedPax}
                options={optionsPax}
                label="Agregar Pasajeros"
                updateSelection={setSelectedPax}
              />
            </Grid>
            <Grid item sx={{ marginTop: "auto" }}>
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
      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success">
          {id ? "File actualizado correctamente" : "File creado correctamente"}
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
          Debes completar todos los campos requeridos (*)
        </Alert>
      </Snackbar>

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
