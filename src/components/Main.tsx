import { Paper, Typography, Grid, Box } from "@mui/material";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person"; // pasajeros
import AssignmentIcon from "@mui/icons-material/Assignment"; // files
import GroupsIcon from "@mui/icons-material/Groups"; // salidas grupales

const sections = [
  {
    title: "PASAJEROS",
    icon: <PersonIcon sx={{ fontSize: 60, color: "#fff" }} />,
    route: "/paxs",
    color: "#0077b6",
  },
  {
    title: "FILES",
    icon: <AssignmentIcon sx={{ fontSize: 60, color: "#fff" }} />,
    route: "/files",
    color: "#0096c7",
  },
  {
    title: "SALIDAS GRUPALES",
    icon: <GroupsIcon sx={{ fontSize: 60, color: "#fff" }} />,
    route: "/groups",
    color: "#023e8a",
  },
];

export const Inicio = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        pt: "8vh",
        pb: 6,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#1f1d1dff",
          fontWeight: "bold",
          mb: 5,
          textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
          letterSpacing: 1,
        }}
      >
        PANEL PRINCIPAL
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{ maxWidth: 900, px: 2 }}
      >
        {sections.map((section) => (
          <Grid item xs={12} sm={6} md={4} key={section.title}>
            <Link to={section.route} style={{ textDecoration: "none" }}>
              <Paper
                elevation={6}
                sx={{
                  height: 180,
                  width: 220,
                  mx: "auto",
                  backgroundColor: section.color,
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                  },
                }}
              >
                {section.icon}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                    mt: 2,
                    letterSpacing: 1,
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: "90%",
                    wordWrap: "break-word",
                  }}
                >
                  {section.title}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
