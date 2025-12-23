import { Box, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { iFile } from "../../model";

interface FileFormFieldsProps {
  formData: iFile;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<iFile>>;
}

export const FileFormFields = ({
  formData,
  handleChange,
  setFormData,
}: FileFormFieldsProps) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        id="nro"
        label="Número de File (Opcional)"
        value={formData.nro || ""}
        onChange={handleChange}
        inputProps={{ maxLength: 50 }}
      />
      <TextField
        id="destino"
        label="Destino *"
        value={formData.destino}
        onChange={handleChange}
        required
      />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DatePicker
          label="Fecha de Salida *"
          value={formData.fechaSalida}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              fechaSalida: value || dayjs(),
            }))
          }
        />
      </LocalizationProvider>
      <TextField
        id="precioNetoTotal"
        label="Precio Neto Total *"
        value={formData.precioNetoTotal}
        onChange={handleChange}
        required
      />
      <TextField
        id="tarifaTotal"
        label="Tarifa Total *"
        value={formData.tarifaTotal}
        onChange={handleChange}
        required
      />
      <TextField
        id="tarifaAlternativa"
        label="Tarifa Alternativa (Opcional)"
        value={formData.tarifaAlternativa || ""}
        onChange={handleChange}
      />
      <TextField
        id="obs"
        label="Observaciones (Opcional)"
        multiline
        rows={5}
        value={formData.obs}
        onChange={handleChange}
        inputProps={{ maxLength: 300 }}
      />
    </Box>
  );
};
