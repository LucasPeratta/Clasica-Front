const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export const loginHandler = async (email: string, password: string) => {
  try {
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};
