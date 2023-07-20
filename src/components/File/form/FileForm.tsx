import { Button, Grid } from "@mui/material";
import { Autocomplete, IOptions } from "../../common/Autocomplete/Autocomplete";
import { useEffect, useState } from "react";
import { iPax } from "../../model";
import { getPax } from "../../Pax/handler";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { iFile } from "../../model";
import { getFileById, createFile, updateFile, addPaxToFile } from "../handler";
import "dayjs/locale/es";
import "./fileForm.scss";
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
  const [paxs, setPaxs] = useState<iPax[]>([]);
  const [selectedPax, setSelectedPax] = useState<IOptions[]>([]);
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

  const options = paxs.map((p) => {
    return {
      id: p.id,
      title: `${p.firstname} ${p.lastname}`,
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

  const addPax = async (idFile: string) => {
    const paxsId: string[] = selectedPax.map((pax) => pax.id);
    console.log(`aca el idFile: ${idFile}`);
    console.log(`aca los paxs seleccionados: ${selectedPax}`);
    console.log(`aca los id de los paxs seleccioandos: ${paxsId}`);

    const response = await addPaxToFile(idFile, paxsId);

    if (response.ok) return true;

    return false;
  };

  //funcion que se llamara cdo se apreta el bton crear y no hay ningun error
  const handleSubmit = async () => {
    if (!validate()) {
      alert("Error: Debes completar todos los campos requeridos(*)");
      return;
    }

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
          const responseData = await response.json();
          console.log(responseData);
          const idFile = responseData.id;
          if (await addPax(idFile)) {
            console.log("File creado correctamente");
            setFormData(initialState);
            navigate("/files");
            setSnackbarOpen(true);
          }
        } else {
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
          <Autocomplete
            options={options}
            label="Agregar pasajeros"
            updateSelection={setSelectedPax}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/files")}
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
            CREAR File
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
