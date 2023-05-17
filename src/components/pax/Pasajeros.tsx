import { useState, useEffect } from "react";

const fetchPax = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/pax");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const usePax = () => {
  const [pax, setPax] = useState<any[]>([]);
  useEffect(() => {
    fetchPax()
      .then((data) => {
        if (typeof data.paxs === "object" && data !== null) {
          const paxArray = data.paxs;
          setPax(paxArray);
        } else {
          console.error("La respuesta de la API no es un objeto válido:", data);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return pax;
};
