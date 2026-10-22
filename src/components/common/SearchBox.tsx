import { InputAdornment, Paper, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * Buscador grande de una lista, con letra cómoda de leer
 */
export const SearchBox = ({ value, onChange, placeholder }: SearchBoxProps) => (
  <Paper
    elevation={0}
    sx={{ p: 1.5, mb: 2, borderRadius: 3, backgroundColor: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}
  >
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputProps={{ "aria-label": placeholder }}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "1.05rem" } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 26 }} />
          </InputAdornment>
        ),
      }}
    />
  </Paper>
);
