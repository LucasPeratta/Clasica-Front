import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { getProviders } from "./handler";

interface MayoristaFieldProps {
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
  // Marcar en rojo si está vacío (después de intentar guardar)
  showError?: boolean;
}

/**
 * Campo "Mayorista" de un servicio: obligatorio, con sugerencias de los ya usados
 * (así "Ola" y "OLA " no quedan como dos mayoristas distintos). Se puede escribir uno nuevo.
 */
export const MayoristaField = ({ value, onChange, size, showError }: MayoristaFieldProps) => {
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    getProviders().then(setOptions);
  }, []);

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      inputValue={value}
      onInputChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          id="provider"
          label="Mayorista *"
          size={size}
          error={!!showError && !value.trim()}
          helperText={
            showError && !value.trim()
              ? "Falta el mayorista: elegilo de la lista o escribilo"
              : "A quién le compramos el servicio"
          }
        />
      )}
    />
  );
};
