import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Save analysis data to the database.
 * @param {Object} data - The data to save.
 * @returns {Promise<any>} - The saved document.
 */
export const saveAnalysisData = async (data: {
  imageUrl: string;
  analysisResult: any; // JSON object
  timestamp: string;
  path: string;
}) => {
  try {
    const response = await prisma.analysisData.create({
      data: {
        imageUrl: data.imageUrl,
        analysisResult: JSON.stringify(data.analysisResult), // Convert JSON to string
        timestamp: new Date(data.timestamp), // Convert timestamp to Date object
        path: data.path,
      },
    });
    return { success: true, data: response };
  } catch (error) {
    console.error("Error saving data:", error); // Log the error
    throw new Error("Failed to save analysis data");
  }
};

/**
 * Retrieve analysis data from the database.
 * @param {number} id - The ID of the document to retrieve.
 * @returns {Promise<any>} - The retrieved document.
 */
export const getAnalysisData = async (id: number) => {
  try {
    const response = await prisma.analysisData.findUnique({
      where: { id },
    });
    if (response) {
      response.analysisResult = JSON.parse(response.analysisResult); // Convert string back to JSON
    }
    return response;
  } catch (error) {
    console.error("Error retrieving data from the database:", error); // Log the error
    throw new Error("Failed to retrieve analysis data from the database.");
  }
};
