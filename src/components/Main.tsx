import { Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import fondoPaxs from "../components/img/viajes-turismo.webp";
import fondoFiles from "../components/img/descarga.jpeg";
import fondoService from "../components/img/aerolineas-asientos-interior.jpg";

const containerStyles = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const sectionStyles = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundSize: "cover",
  backgroundPosition: "center",
  cursor: "pointer",
  textDecoration: "none",
  minHeight: "200px",
  minWidth: "300px",
  color: "white",
  transition: "box-shadow 0.3s",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  margin: "15px",

  ":hover": {
    boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.7)",
  },
};

const typeStyles = {
  fontFamily: "Arial, sans-serif",
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "8px",
  color: "#fff",
};

const highlightedText = {
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  padding: "0 6px",
  borderRadius: "4px",
};

export const Inicio = () => {
  return (
    <div style={containerStyles}>
      <Link to="/paxs" style={{ textDecoration: "none" }}>
        <Paper
          elevation={3}
          sx={{ ...sectionStyles, backgroundImage: `url(${fondoPaxs})` }}
        >
          <Typography variant="h5" gutterBottom style={typeStyles}>
            <span style={highlightedText}>PAXS</span>
          </Typography>
        </Paper>
      </Link>

      <Link to="/services" style={{ textDecoration: "none" }}>
        <Paper
          elevation={3}
          sx={{ ...sectionStyles, backgroundImage: `url(${fondoService})` }}
        >
          <Typography variant="h5" gutterBottom style={typeStyles}>
            <span style={highlightedText}>SERVICES</span>
          </Typography>
        </Paper>
      </Link>

      <Link to="/files" style={{ textDecoration: "none" }}>
        <Paper
          elevation={3}
          sx={{ ...sectionStyles, backgroundImage: `url(${fondoFiles})` }}
        >
          <Typography variant="h5" gutterBottom style={typeStyles}>
            <span style={highlightedText}>FILES</span>
          </Typography>
        </Paper>
      </Link>
    </div>
  );
};
