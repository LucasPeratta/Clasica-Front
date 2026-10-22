import { Link } from "react-router-dom";
import { Box, Typography, Button, Divider, Card, CardContent, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { iFile } from "../../model";
import { formatFileNumber } from "../../utils/fileNumber";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

interface FileProfileHeaderProps {
  file: iFile;
  onSave: (editedFile: iFile) => Promise<unknown>;
  // Abre la confirmación para eliminar el file
  onDelete?: () => void;
}

export const FileProfileHeader = ({ file, onSave, onDelete }: FileProfileHeaderProps) => {
  const [editedFile, setEditedFile] = useState<iFile>(file);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditedFile(file);
  }, [file]);

  const handleEditStart = () => {
    setEditedFile(file);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedFile(file);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedFile);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, color: "#0d47a1", textAlign: "center" }}
      >
        {formatFileNumber(file) ? `File ${formatFileNumber(file)}` : "Detalles del File"}
      </Typography>

      <Box display="flex" justifyContent="center" gap={2} sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/files"
          variant="outlined"
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          Volver
        </Button>
        {!isEditing && (
          <Button
            onClick={handleEditStart}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
            }}
          >
            Editar
          </Button>
        )}
        {!isEditing && onDelete && (
          <Button
            onClick={onDelete}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
          >
            Eliminar
          </Button>
        )}
      </Box>

      {/* Detalles del File - Campos Editables Inline */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0d47a1", mb: 2 }}>
            {isEditing ? "Editar Detalles" : "Detalles"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Referencia"
              value={editedFile?.nro || ""}
              onChange={(e) => setEditedFile(prev => ({ ...prev, nro: e.target.value }))}
              fullWidth
              disabled={!isEditing}
              InputProps={{
                sx: {
                  color: "#000",
                  fontWeight: isEditing ? 400 : 700,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isEditing ? "inherit" : "#ccc",
                  },
                  "&.Mui-disabled": {
                    color: "#000",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                  },
                }
              }}
            />
            <TextField
              label="Destino"
              value={editedFile?.destino || ""}
              onChange={(e) => setEditedFile(prev => ({ ...prev, destino: e.target.value }))}
              fullWidth
              disabled={!isEditing}
              InputProps={{
                sx: {
                  color: "#000",
                  fontWeight: isEditing ? 400 : 700,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isEditing ? "inherit" : "#ccc",
                  },
                  "&.Mui-disabled": {
                    color: "#000",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                  },
                }
              }}
            />
            <TextField
              label="Fecha de salida"
              type="date"
              value={editedFile?.fechaSalida ? (dayjs.isDayjs(editedFile.fechaSalida) ? editedFile.fechaSalida.format('YYYY-MM-DD') : dayjs(editedFile.fechaSalida).format('YYYY-MM-DD')) : ""}
              onChange={(e) => setEditedFile(prev => ({ ...prev, fechaSalida: dayjs(e.target.value) }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              disabled={!isEditing}
              InputProps={{
                sx: {
                  color: "#000",
                  fontWeight: isEditing ? 400 : 700,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isEditing ? "inherit" : "#ccc",
                  },
                  "&.Mui-disabled": {
                    color: "#000",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                  },
                }
              }}
            />
            <TextField
              label="Tarifa Alternativa"
              value={editedFile?.tarifaAlternativa || ""}
              onChange={(e) => setEditedFile(prev => ({ ...prev, tarifaAlternativa: e.target.value }))}
              fullWidth
              disabled={!isEditing}
              InputProps={{
                sx: {
                  color: "#000",
                  fontWeight: isEditing ? 400 : 700,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isEditing ? "inherit" : "#ccc",
                  },
                  "&.Mui-disabled": {
                    color: "#000",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                  },
                }
              }}
            />
            <TextField
              label="Observaciones"
              value={editedFile?.obs || ""}
              onChange={(e) => setEditedFile(prev => ({ ...prev, obs: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              disabled={!isEditing}
              InputProps={{
                sx: {
                  color: "#000",
                  fontWeight: isEditing ? 400 : 700,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isEditing ? "inherit" : "#ccc",
                  },
                  "&.Mui-disabled": {
                    color: "#000",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ccc",
                    },
                  },
                }
              }}
            />
            {isEditing && (
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSaving}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    fontWeight: 600,
                    background: "linear-gradient(135deg, #007bff 0%, #6f42c1 100%)",
                  }}
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ mb: 3 }} />
    </>
  );
};
