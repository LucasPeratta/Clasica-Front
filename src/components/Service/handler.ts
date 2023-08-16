import { iService } from "../model";

export const getService = async (): Promise<iService[]> => {
  try {
    const response = await fetch("http://localhost:3001/api/service");
    const data = await response.json();
    return data.services;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await fetch(`http://localhost:3001/api/service/${id}`, {
      method: "DELETE",
    });
    console.log("service deleted successfully");
  } catch (error) {
    console.error(error);
  }
};

export const softDeleteService = async (id: string): Promise<void> => {
  try {
    await fetch(`http://localhost:3001/api/service/${id}`, {
      method: "PATCH",
    });
    console.log("Service soft deleted successfully");
  } catch (error) {
    console.error(error);
  }
};

export const getServiceById = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/service/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updateService = async (id: string, formData: iService) => {
  try {
    const response = await fetch(`http://localhost:3001/api/service/${id}`, {
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

export const createService = async (formData: iService): Promise<Response> => {
  try {
    const response = await fetch("http://localhost:3001/api/service/create", {
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
