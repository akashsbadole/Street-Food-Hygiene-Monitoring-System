import { saveAnalysisData } from "../databaseService";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { imageUrl, analysisResult, timestamp } = req.body;
      const response = await saveAnalysisData({ imageUrl, analysisResult, timestamp });
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in API handler:", error);
      res.status(500).json({ error: "Failed to save analysis data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
