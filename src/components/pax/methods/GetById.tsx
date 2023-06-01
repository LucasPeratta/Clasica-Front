import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

interface PaxDates {
  id: string;
  firstname: string;
  lastname: string;
  dni: string;
  passport: string;
  dob: string;
  adress: string;
  email: string;
  PhoneNumber: string;
  obs: string;
}

export const GetById = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [paxDates, setPaxDates] = useState<PaxDates | null>(null);

  useEffect(() => {
    const getPaxDates = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/pax/${id}`);
        const data = await response.json();
        console.log(data);
        setPaxDates(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    getPaxDates();
  }, [id]); //Indica que el efecto se ejecutará cada vez que el valor de id cambie.

  if (!paxDates) {
    return <div>error</div>;
  }

  return (
    <div>
      <h1>
        {paxDates.firstname} {paxDates.lastname}
      </h1>
      <p>DNI: {paxDates.dni}</p>
      <p>Pasaporte: {paxDates.passport}</p>
      <p>Fecha de Nacimiento: {paxDates.dob}</p>
      <p>Direccion: {paxDates.adress}</p>
      <p>Email: {paxDates.email}</p>
      <p>Celular: {paxDates.PhoneNumber}</p>
      <p>Observaciones: {paxDates.obs}</p>
      <Link to={`/paxs/updatePax/${paxDates.id}`}>
        <button>Editar</button>
      </Link>
    </div>
  );
};
