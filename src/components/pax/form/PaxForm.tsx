import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Stack,
  TextField,
  Button,
  Avatar,
  Chip,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import { useNavigate, useParams } from "react-router-dom";

import { iPax } from "../model";
import { getPaxById, createPax, updatePax } from "../handler";
import { LoadingScreen } from "../../LoadingScreen";

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

function initials(lastname = "", firstname = "") {
  const a = (lastname || "").trim()[0] ?? "";
  const b = (firstname || "").trim()[0] ?? "";
  return (a + b).toUpperCase();
}

export const PaxForm = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<iPax>(initialState);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [errorNotificationOpen, setErrorNotificationOpen] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      getPaxById(id)
        .then((pax) => {
          if (pax) {
            // adaptar dob a dayjs si viene del backend
            pax.dob = pax.dob ? (dayjs(pax.dob) as unknown as Dayjs) : null;
            setFormData(pax);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <LoadingScreen />;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;

    if (id === "passport") {
      const formattedValue = value.toUpperCase();
      setFormData((prev) => ({ ...prev, passport: formattedValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const required = ["firstname", "lastname"];
    const missing = required.filter(
      (fld) =>
        !formData[fld as keyof iPax] ||
        `${formData[fld as keyof iPax]}`.trim() === ""
    );
    return missing.length === 0;
  };

  const openSuccess = () => setNotificationOpen(true);
  const openError = () => setErrorNotificationOpen(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (id) {
        // update
        const resp = await updatePax(id, formData);
        if (resp.ok) {
          openSuccess();
          setTimeout(() => {
            navigate(`/paxs/profile/${id}`);
          }, 1200);
        } else {
          const err = await resp.json();
          if (err.errorCode === "P2002") {
            openError();
          }
        }
      } else {
        // create
        const resp = await createPax(formData);
        if (resp.ok) {
          openSuccess();
          setTimeout(() => {
            navigate("/paxs");
          }, 1200);
        } else {
          const err = await resp.json();
          if (err.errorCode === "P2002") {
            openError();
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6 },
        py: 3,
        background: "linear-gradient(135deg, #e3f2fd 0%, #dbeeff 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* HEADER IGUAL AL DEL PERFIL */}
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 56,
                height: 56,
                fontSize: 22,
              }}
            >
              {initials(formData.lastname, formData.firstname)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {formData.firstname || formData.lastname
                  ? `${formData.firstname} ${formData.lastname}`.trim()
                  : id
                  ? "Editar pasajero"
                  : "Nuevo pasajero"}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip size="small" color="primary" label="Pasajero" />
                {id ? (
                  <Chip size="small" label="Edición" color="warning" />
                ) : (
                  <Chip size="small" label="Creación" color="success" />
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() =>
                id ? navigate(`/paxs/profile/${id}`) : navigate("/paxs")
              }
            >
              Volver
            </Button>
            <Button type="submit" form="pax-form" variant="contained">
              {id ? "Guardar cambios" : "Crear pasajero"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* FORMULARIO */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <form id="pax-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* nombre */}
            <Grid item xs={12} md={6}>
              <TextField
                id="firstname"
                label="Nombre *"
                fullWidth
                value={formData.firstname}
                onChange={handleChange}
                inputProps={{ maxLength: 25 }}
              />
            </Grid>
            {/* apellido */}
            <Grid item xs={12} md={6}>
              <TextField
                id="lastname"
                label="Apellido *"
                fullWidth
                value={formData.lastname}
                onChange={handleChange}
                inputProps={{ maxLength: 25 }}
              />
            </Grid>
            {/* DNI */}
            <Grid item xs={12} md={6}>
              <TextField
                id="dni"
                label="DNI"
                fullWidth
                value={formData.dni ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            {/* PASAPORTE */}
            <Grid item xs={12} md={6}>
              <TextField
                id="passport"
                label="Nro Pasaporte"
                fullWidth
                value={formData.passport ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 9 }}
              />
            </Grid>
            {/* FECHA */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es"
              >
                <DatePicker
                  label="Fecha de nacimiento"
                  value={formData.dob ? dayjs(formData.dob) : null}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      dob: value ?? null,
                    }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            {/* DIRECCION */}
            <Grid item xs={12} md={6}>
              <TextField
                id="adress"
                label="Dirección"
                fullWidth
                value={formData.adress ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 30 }}
              />
            </Grid>
            {/* EMAIL */}
            <Grid item xs={12} md={6}>
              <TextField
                id="email"
                label="Email"
                fullWidth
                value={formData.email ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 35 }}
              />
            </Grid>
            {/* CELULAR */}
            <Grid item xs={12} md={6}>
              <TextField
                id="phoneNumber"
                label="Nro de celular"
                fullWidth
                value={formData.phoneNumber ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 35 }}
              />
            </Grid>
            {/* OBS */}
            <Grid item xs={12}>
              <TextField
                id="obs"
                label="Observaciones"
                fullWidth
                multiline
                rows={4}
                value={formData.obs ?? ""}
                onChange={handleChange}
                inputProps={{ maxLength: 300 }}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* SNACKBARS */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity="success">
          {id ? "Pax actualizado correctamente" : "Pax creado correctamente"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorNotificationOpen}
        autoHideDuration={4000}
        onClose={() => setErrorNotificationOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorNotificationOpen(false)} severity="error">
          El mail ingresado ya se encuentra registrado
        </Alert>
      </Snackbar>
    </Box>
  );
};
