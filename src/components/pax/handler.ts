import { iPax } from "./model";

export const getPax = async (): Promise<iPax[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/pax");
    const data = await response.json();
    return data.paxs;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deletePax = async (id: string): Promise<void> => {
  try {
    await fetch(`http://localhost:3001/api/pax/${id}`, {
      method: "DELETE",
    });
    console.log("Pax deleted successfully");
  } catch (error) {
    console.error(error);
  }
};

export const getPaxById = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/pax/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updatePax = async (id: string, formData: iPax) => {
  try {
    const response = await fetch(`http://localhost:3001/api/pax/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    // const data = await response.json();
    return response;
  } catch (error) {
    console.error("Error de red:", error);
    throw error;
  }
};

export const createPax = async (formData: iPax): Promise<Response> => {
  try {
    const response = await fetch("http://localhost:3001/api/pax/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
