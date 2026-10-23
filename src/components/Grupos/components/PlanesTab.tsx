import { useState } from "react";
import { Alert, Box, Button, IconButton, Paper, Snackbar, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { deletePlan } from "../handler";
import { iGrupo, iGrupoPlan } from "../model";
import { GrupoPlanDialog } from "./GrupoPlanDialog";

/**
 * Planes de pago del grupo (ej. Preventa, Normal): cada reserva elige uno
 */
export const PlanesTab = ({ grupo, onChange }: { grupo: iGrupo; onChange: () => void }) => {
  const [editing, setEditing] = useState<iGrupoPlan | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const usedBy = (planId: string) => grupo.reservas.filter((r) => r.planId === planId).length;

  const handleDelete = async (plan: iGrupoPlan) => {
    const result = await deletePlan(grupo.id, plan.id);
    if (result.ok) onChange();
    else setError(result.msg);
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0D5B75" }}>
          Planes de pago
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing("new")} sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
          Crear plan
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada reserva elige uno. Las cuotas son porcentajes de lo que paga esa reserva, con su fecha; la última es el saldo. Si cambiás un
        plan, se actualiza en todas las reservas que lo usan. Sin plan, la reserva usa el automático (seña = aéreos, saldo 25 días antes).
      </Typography>

      {grupo.planes.length === 0 ? (
        <Typography color="text.secondary">Todavía no hay planes. Por ejemplo: "Preventa" y "Normal".</Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
          {grupo.planes.map((plan) => (
            <Paper key={plan.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>{plan.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {usedBy(plan.id) === 0 ? "Ninguna reserva lo usa" : `Lo usa${usedBy(plan.id) === 1 ? " 1 reserva" : `n ${usedBy(plan.id)} reservas`}`}
                  </Typography>
                </Box>
                <Box sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Editar">
                    <IconButton onClick={() => setEditing(plan)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar (sus reservas pasan al plan automático)">
                    <IconButton color="error" onClick={() => handleDelete(plan)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                {plan.cuotas.map((c, i) => (
                  <Box key={i} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5, borderBottom: "1px solid #eef2f4", "&:last-of-type": { borderBottom: "none" } }}>
                    <Typography>
                      <strong>{c.concepto}</strong> · {c.porcentaje === null ? "el saldo" : `${c.porcentaje}%`}
                    </Typography>
                    <Typography color="text.secondary">vence {dayjs(c.vencimiento).format("DD/MM/YYYY")}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {editing && (
        <GrupoPlanDialog
          grupoId={grupo.id}
          fechaSalida={grupo.fechaSalida}
          plan={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChange();
          }}
        />
      )}
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
