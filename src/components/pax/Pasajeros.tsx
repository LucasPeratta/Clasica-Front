import { useState, useEffect } from "react";

interface Pax {
  id: number;
  firstname: string;
  email: string;
  dob: string;
  obs: string;
}

//fetchPax es una función asincrónica que devuelve una promesa de tipo Pax[]
//La función fetch devuelve una promesa que representa la respuesta HTTP.
//response.json() es otro método asincrónico que extrae los datos del cuerpo de la respuesta HTTP en formato JSON.
//Devuelve una promesa que se resuelve con los datos JSON obtenidos.
const fetchPax = async (): Promise<Pax[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/pax");
    console.log(response);
    const data = await response.json();
    console.log(data);

    if (typeof data.paxs === "object" && data !== null) {
      return data.paxs;
    } else {
      console.error("La respuesta de la API no es un objeto válido:", data);
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const Pasajeros = () => {
  const [pax, setPax] = useState<Pax[]>([]);
  useEffect(() => {
    fetchPax().then((data) => {
      setPax(data);
    });
  }, []);

  return pax;
};
