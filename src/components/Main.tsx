import { Link } from "react-router-dom";

export const Inicio = () => {
  return (
    <>
      <Link to={`/paxs`}>
        <button>PAXS</button>
      </Link>
      <Link to={`/files`}>
        <button>FILES</button>
      </Link>
      <Link to={`/services`}>
        <button>SERVICE</button>
      </Link>
    </>
  );
};
