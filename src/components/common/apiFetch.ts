/**
 * fetch que agrega el token de sesión a cada consulta al backend.
 * Si el backend responde 401 la sesión venció o no es válida: se cierra y se vuelve al login.
 * (No usar en el login: ahí un 401 significa contraseña incorrecta.)
 */
export const apiFetch = async (
  input: string,
  init: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.assign("/login");
  }

  return response;
};
