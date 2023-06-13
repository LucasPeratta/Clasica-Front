import { IPax } from "./model";

export const getPax = async (): Promise<IPax[]> => {
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
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const updatePax = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/pax/${id}`);
    const obj = await response.json();
    return obj.data;
  } catch (error) {
    console.error(error);
  }
};
