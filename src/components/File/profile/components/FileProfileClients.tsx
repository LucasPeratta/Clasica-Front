import { useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent, Avatar } from "@mui/material";
import { iPax } from "../../../Pax/model";
import { initials } from "../../utils/formatters";

interface FileProfileClientsProps {
  clients: iPax[];
  fileId: string;
}

export const FileProfileClients = ({
  clients,
  fileId,
}: FileProfileClientsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1, color: "#0d47a1" }}
      >
        Clientes
      </Typography>
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {clients.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay pasajeros asociados.
              </Typography>
            </Box>
          ) : (
            clients.map((client: iPax) => (
              <Box
                key={client.id}
                onClick={() =>
                  navigate(`/paxs/profile/${client.id}`, {
                    state: { fromFileId: fileId },
                  })
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  cursor: "pointer",
                  transition: "background 0.15s",
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  "&:hover": {
                    backgroundColor: "rgba(13,71,161,0.04)",
                  },
                  "&:last-of-type": {
                    borderBottom: "none",
                  },
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {initials(client.lastname, client.firstname)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {client.lastname} {client.firstname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {client.email || "Sin email"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {client.dni || "—"}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
};
