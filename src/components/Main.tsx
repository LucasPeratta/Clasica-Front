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
        background: "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%)",
        backgroundImage: 
          "linear-gradient(135deg, #0D5B75 0%, #1a7a99 50%, #89c2d9 100%), " +
          "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), " +
          "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        pt: "12vh",
        pb: 6,
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{ maxWidth: 1000, px: 2, mb: 16 }}
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
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  animation: "fadeIn 0.6s ease-out",
                  "@keyframes fadeIn": {
                    from: { opacity: 0, transform: "translateY(20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                  "&:hover": {
                    transform: "translateY(-12px) scale(1.05)",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
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

      {/* Logo Clásica Moderna */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          borderRadius: "24px",
          p: 4,
          boxShadow: "0 12px 32px rgba(0,0,0,0.35), 0 0 40px rgba(255,255,255,0.1)",
          maxWidth: 550,
          mx: 2,
          border: "3px solid rgba(255, 255, 255, 0.3)",
          animation: "logoFadeIn 0.8s ease-out, logoPulse 3s ease-in-out infinite",
          "@keyframes logoFadeIn": {
            from: { opacity: 0, transform: "scale(0.9)" },
            to: { opacity: 1, transform: "scale(1)" },
          },
          "@keyframes logoPulse": {
            "0%, 100%": { boxShadow: "0 12px 32px rgba(0,0,0,0.35), 0 0 40px rgba(255,255,255,0.1)" },
            "50%": { boxShadow: "0 12px 32px rgba(0,0,0,0.35), 0 0 60px rgba(255,255,255,0.2)" },
          },
        }}
      >
        <img
          src="/clasicalogo.jpg"
          alt="Clásica Moderna"
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "16px",
            display: "block",
          }}
        />
      </Box>
    </Box>
  );
};
