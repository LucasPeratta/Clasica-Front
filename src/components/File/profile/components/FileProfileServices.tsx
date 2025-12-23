import { Box, Typography, Card, CardContent } from "@mui/material";
import { iService } from "../../../Service/model";

interface FileProfileServicesProps {
  services: iService[];
}

export const FileProfileServices = ({ services }: FileProfileServicesProps) => {
  return (
    <>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 1, color: "#0d47a1" }}
      >
        Servicios
      </Typography>
      <Card elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {services.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">
                No hay servicios asociados.
              </Typography>
            </Box>
          ) : (
            services.map((service: iService) => (
              <Box
                key={service.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Typography sx={{ fontWeight: 600, minWidth: 180 }}>
                  {service.nombre}
                </Typography>
                <Typography>
                  Precio Neto:{" "}
                  {service.precioNeto ? `$${service.precioNeto}` : "—"}
                </Typography>
                <Typography>
                  Tarifa: {service.tarifa ? `$${service.tarifa}` : "—"}
                </Typography>
                <Typography>{service.currency || ""}</Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {service.obs || ""}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
};
