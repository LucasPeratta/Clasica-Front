import { Grid, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { iPax } from "../../model";

interface PaxFormFieldsProps {
  formData: iPax;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<iPax>>;
}

// Helper para manejar valores dayjs correctamente
const getDayjsValue = (value: any) => {
  if (!value) return null;
  // Si ya es dayjs, devolverlo tal cual
  if (dayjs.isDayjs(value)) return value;
  // Si no, parsearlo
  return dayjs(value);
};

export const PaxFormFields = ({
  formData,
  handleChange,
  setFormData,
}: PaxFormFieldsProps) => {
  return (
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
          label="DNI (Opcional)"
          fullWidth
          value={formData.dni ?? ""}
          onChange={handleChange}
          inputProps={{ maxLength: 10 }}
        />
      </Grid>
      {/* DNI Vencimiento */}
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Vto DNI (Opcional)"
            value={getDayjsValue(formData.dniVto)}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                dniVto: value ?? null,
              }))
            }
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Grid>
      {/* PASAPORTE */}
      <Grid item xs={12} md={6}>
        <TextField
          id="passport"
          label="Nro Pasaporte (Opcional)"
          fullWidth
          value={formData.passport ?? ""}
          onChange={handleChange}
          inputProps={{ maxLength: 9 }}
        />
      </Grid>
      {/* Pasaporte Vencimiento */}
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Vto Pasaporte (Opcional)"
            value={getDayjsValue(formData.passportVto)}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                passportVto: value ?? null,
              }))
            }
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
      </Grid>
      {/* FECHA */}
      <Grid item xs={12} md={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <DatePicker
            label="Fecha de nacimiento (Opcional)"
            value={getDayjsValue(formData.dob)}
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
          label="Dirección (Opcional)"
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
          label="Email (Opcional)"
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
          label="Nro de celular (Opcional)"
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
          label="Observaciones (Opcional)"
          fullWidth
          multiline
          rows={4}
          value={formData.obs ?? ""}
          onChange={handleChange}
          inputProps={{ maxLength: 300 }}
        />
      </Grid>
    </Grid>
  );
};
