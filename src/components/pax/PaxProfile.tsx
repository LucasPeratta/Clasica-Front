import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getPaxById } from "./handler";

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

export const PaxProfile = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [paxDates, setPaxDates] = useState<PaxDates | null>(null);

  useEffect(() => {
    if (!id) return;
    getPaxById(id)
      .then((data) => {
        setPaxDates(data);
      })
      .catch((error) => {
        console.error(error);
      });
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
      <Link to={`/paxs/update/${paxDates.id}`}>
        <button>Editar</button>
      </Link>
    </div>
  );
};
