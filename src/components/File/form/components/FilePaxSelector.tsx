import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Checkbox,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { iPax } from "../../../Pax/model";

interface FilePaxSelectorProps {
  paxs: iPax[];
  selectedPaxIds: string[];
  setSelectedPaxIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const FilePaxSelector = ({
  paxs,
  selectedPaxIds,
  setSelectedPaxIds,
}: FilePaxSelectorProps) => {
  const [paxDialogOpen, setPaxDialogOpen] = useState(false);
  const [paxSearch, setPaxSearch] = useState("");

  const filteredPaxs = paxs.filter((p) => {
    if (!paxSearch.trim()) return true;
    const q = paxSearch.toLowerCase();
    return (
      p.firstname.toLowerCase().includes(q) ||
      p.lastname.toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q)
    );
  });

  const togglePax = (paxId: string) => {
    setSelectedPaxIds((prev) =>
      prev.includes(paxId)
        ? prev.filter((id) => id !== paxId)
        : [...prev, paxId]
    );
  };

  const getPaxById = (paxId: string) => paxs.find((p) => p.id === paxId);

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setPaxDialogOpen(true)}
        sx={{ mb: 1, textTransform: "none", fontWeight: 500 }}
      >
        Seleccionar pasajeros
      </Button>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
        {selectedPaxIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay pasajeros seleccionados
          </Typography>
        ) : (
          selectedPaxIds.map((paxId) => {
            const pax = getPaxById(paxId);
            return (
              <Chip
                key={paxId}
                label={pax ? `${pax.lastname} ${pax.firstname}` : paxId}
                onDelete={() =>
                  setSelectedPaxIds((prev) => prev.filter((id) => id !== paxId))
                }
              />
            );
          })
        )}
      </Box>

      {/* Dialog */}
      <Dialog
        open={paxDialogOpen}
        onClose={() => setPaxDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleccionar pasajeros</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            placeholder="Buscar pasajero..."
            value={paxSearch}
            onChange={(e) => setPaxSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <List sx={{ maxHeight: 350, overflowY: "auto" }}>
            {filteredPaxs.map((p) => {
              const checked = selectedPaxIds.includes(p.id);
              return (
                <ListItem
                  key={p.id}
                  dense
                  onClick={() => togglePax(p.id)}
                  sx={{ cursor: "pointer" }}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      checked={checked}
                      onChange={() => togglePax(p.id)}
                    />
                  }
                >
                  <ListItemText
                    primary={`${p.lastname} ${p.firstname}`}
                    secondary={p.email || ""}
                  />
                </ListItem>
              );
            })}
            {filteredPaxs.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No se encontraron pasajeros
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaxDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
