import * as express from 'express';
import bodyParser from "body-parser";
import cors from "cors";
import { saveAnalysisData } from "./databaseService";
import { PrismaClient } from '@prisma/client';

const app = express.default();  // Use express.default() for TypeScript
const prisma = new PrismaClient();
const PORT = 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Successfully connected to SQLite database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

// API Routes
app.post("/api/saveAnalysis", async (req, res) => {
  try {
    const { imageUrl, analysisResult, timestamp } = req.body;
    const response = await saveAnalysisData({ 
      imageUrl, 
      analysisResult, 
      timestamp 
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in /api/saveAnalysis:", error);
    res.status(500).json({ error: "Failed to save analysis data" });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
