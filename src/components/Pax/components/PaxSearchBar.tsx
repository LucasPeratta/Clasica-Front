import { Paper, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

interface PaxSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export const PaxSearchBar = ({
  searchTerm,
  onSearchChange,
  onAddClick,
}: PaxSearchBarProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      }}
    >
      <TextField
        fullWidth
        placeholder="Buscar pasajero"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "#fff",
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        onClick={onAddClick}
        startIcon={<AddIcon />}
        sx={{
          textTransform: "uppercase",
          fontWeight: 600,
          borderRadius: 3,
          px: 3,
          py: 1.2,
          background: "linear-gradient(135deg, #0D5B75 0%, #1a7a99 100%)",
          boxShadow: "0 4px 12px rgba(13,91,117,0.3)",
          color: "#fff",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #0a4a5e 0%, #15677f 100%)",
            boxShadow: "0 6px 20px rgba(13,91,117,0.4)",
            transform: "translateY(-2px)",
          },
        }}
      >
        Nuevo pasajero
      </Button>
    </Paper>
  );
};
