import { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { getProviders } from "./handler";

interface MayoristaFieldProps {
  value: string;
  onChange: (value: string) => void;
  size?: "small" | "medium";
}

/**
 * Campo "Mayorista" de un servicio: obligatorio, con sugerencias de los ya usados
 * (así "Ola" y "OLA " no quedan como dos mayoristas distintos). Se puede escribir uno nuevo.
 */
export const MayoristaField = ({ value, onChange, size }: MayoristaFieldProps) => {
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
          error={!value.trim()}
          helperText={!value.trim() ? "Obligatorio: se usa al registrar el pago al mayorista" : undefined}
        />
      )}
    />
  );
};
