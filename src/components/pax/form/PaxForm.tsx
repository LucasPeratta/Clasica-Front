import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useNavigate, useParams } from "react-router-dom";
import { iPax } from "../../model";
import { getPaxById, createPax, updatePax } from "../handler";
import Grid from "@mui/material/Grid";
import "dayjs/locale/es";
import "./styles.scss";
import dayjs from "dayjs";
import { Alert, Snackbar } from "@mui/material";

const initialState: iPax = {
  id: "",
  firstname: "",
  lastname: "",
  dni: "",
  passport: "",
  dob: null,
  adress: "",
  email: "",
  phoneNumber: "",
  obs: "",
};

export const PaxForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialState);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  useEffect(() => {
    if (id) {
      getPaxById(id)
        .then((pax) => {
          if (pax) {
            console.log(pax);
            pax.dob = dayjs(pax.dob);

            setFormData(pax);
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

  const openNotification = () => {
    setNotificationOpen(true);
  };

  const openErrorNotification = () => {
    setErrorNotificationOpen(true);
  };

  //para validar errores
  const validate = () => {
    // Validar campos requeridos
    const requiredFields = [
      "firstname",
      "lastname",
      "dni",
      "passport",
      "dob",
      "email",
      "phoneNumber",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof typeof formData]
    );

    if (missingFields.length > 0) {
      console.log(missingFields);
      console.log("Error: Debes completar todos los campos requeridos.");
      return false;
    }
    return true;
  };

  //funcion que se llamara cdo se apreta el bton crear y no hay ningun error
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (id) {
        // Actualización
        const response = await updatePax(id, formData);
        if (response.ok) {
          console.log("Pasajero actualizado correctamente");
          openNotification();
          setTimeout(() => {
            navigate(`/paxs/profile/${id}`);
          }, 1500);
        } else {
          const errorData = await response.json();
          if (
            errorData.errorCode === "P2002" &&
            errorData.msg === "Error: Email already exists"
          ) {
            openErrorNotification();
          } else {
            console.log("Error al actualizar el pasajero");
          }
        }
      } else {
        // Creación
        const response = await createPax(formData);

        if (response.ok) {
          console.log("Pasajero creado correctamente");
          setFormData(initialState);
          openNotification();
          setTimeout(() => {
            navigate("/paxs");
          }, 1500);
        } else {
          console.log(response);
          const errorData = await response.json();
          console.log(errorData);

          if (
            errorData.errorCode === "P2002" &&
            errorData.msg === "Error: Email already exists"
          ) {
            openErrorNotification();
          } else {
            console.log("Error al crear el pasajero");
          }
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <>
      <div className="pax-form-container">
        <Box>
          <FormControl className="form">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <TextField
                  id="firstname"
                  label="Nombre"
                  variant="outlined"
                  required
                  inputProps={{ maxLength: 25 }}
                  value={formData.firstname}
                  onChange={handleChange}
                />
                <TextField
                  id="lastname"
                  label="Apellido"
                  variant="outlined"
                  required
                  inputProps={{ maxLength: 25 }}
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

                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="es"
                >
                  <DatePicker
                    label="Fecha de nacimiento"
                    value={formData.dob}
                    onChange={(value) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        dob: value,
                      }));
                    }}
                  />
                </LocalizationProvider>

                <TextField
                  id="adress"
                  label="Direccion"
                  variant="outlined"
                  required
                  inputProps={{ maxLength: 30 }}
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
                  id="phoneNumber"
                  label="Nro de celular"
                  variant="outlined"
                  required
                  inputProps={{ maxLength: 35 }}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="obs-field">
                <TextField
                  id="obs"
                  label="Observaciones"
                  multiline
                  inputProps={{ maxLength: 300 }}
                  rows={5}
                  variant="outlined"
                  value={formData.obs}
                  onChange={handleChange}
                />
              </div>
              <div className="button-grid">
                <Grid container spacing={2} justifyContent="space-between">
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={
                        id
                          ? () => navigate(`/paxs/profile/${id}`)
                          : () => navigate("/paxs")
                      }
                    >
                      Volver
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button type="submit" variant="contained" color="success">
                      {id ? "ACTUALIZAR PASAJERO" : "CREAR PASAJERO"}
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </form>
          </FormControl>
        </Box>
      </div>
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
          {id ? "Pax actualizado correctamente" : "Pax creado correctamente"}
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
          EL mail ingresado ya se encuentra registrado
        </Alert>
      </Snackbar>
    </>
  );
};
