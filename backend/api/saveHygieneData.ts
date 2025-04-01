import { createRouter } from "express"; // Use createRouter for express@5.x.x
import { saveAnalysisData } from "../databaseService";

const router = createRouter(); // Use createRouter instead of Router()

// POST route to save hygiene data
router.post("/saveHygieneData", async (req, res) => {
  try {
    const { imageUrl, analysisResult, timestamp } = req.body;

    // Validate request body
    if (!imageUrl || !analysisResult || !timestamp) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Save data to the database
    const response = await saveAnalysisData({ imageUrl, analysisResult, timestamp });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in /saveHygieneData:", error);
    res.status(500).json({ error: "Failed to save hygiene data" });
  }
});

export default router;
