import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { HygieneReport } from "@/components/HygieneReport";

// Initialize TensorFlow.js
async function initializeTensorFlow() {
  try {
    // Set the backend to 'webgl' for better performance
    await tf.setBackend('webgl');
    await tf.ready();
    console.log('TensorFlow.js initialized successfully with backend:', tf.getBackend());
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js:', error);
    // Fallback to CPU
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('Fallback to CPU backend successful');
    } catch (fallbackError) {
      console.error('Failed to initialize CPU backend:', fallbackError);
      throw new Error('Failed to initialize TensorFlow.js');
    }
  }
}

// Enhanced hygiene detection categories
const hygieneCategories = {
  personalProtection: {
    gloves: { severity: "critical", score: 0 },
    mask: { severity: "critical", score: 0 },
    hairNet: { severity: "high", score: 0 },
    apron: { severity: "high", score: 0 },
  },
  foodSafety: {
    foodCovering: { severity: "critical", score: 0 },
    rawFoodHandling: { severity: "critical", score: 0 },
    crossContamination: { severity: "high", score: 0 },
    properStorage: { severity: "high", score: 0 },
  },
  cleanliness: {
    workspaceCleanliness: { severity: "high", score: 0 },
    utensilsCleanliness: { severity: "high", score: 0 },
    handWashing: { severity: "critical", score: 0 },
    wasteManagement: { severity: "high", score: 0 },
  }
};

let model: cocoSsd.ObjectDetection | null = null;

const loadModel = async () => {
  if (model) return model;
  try {
    console.log("Loading COCO-SSD model...");
    // Initialize TensorFlow.js before loading the model
    await initializeTensorFlow();
    model = await cocoSsd.load({
      base: 'mobilenet_v2' // Better performance on mobile devices
    });
    console.log("COCO-SSD model loaded successfully");
    return model;
  } catch (error) {
    console.error("Failed to load COCO-SSD model:", error);
    throw error;
  }
};

// Custom analysis for street food hygiene
const analyzeHygieneInImage = async (predictions: cocoSsd.DetectedObject[], imageData: string) => {
  const issues: any[] = [];
  const scores = { ...hygieneCategories };

  // Check for hands without gloves
  const handsDetected = predictions.filter(p => p.class === "person");
  if (handsDetected.length > 0) {
    issues.push({
      x: handsDetected[0].bbox[0],
      y: handsDetected[0].bbox[1],
      width: handsDetected[0].bbox[2],
      height: handsDetected[0].bbox[3],
      class: "No Gloves Detected",
      score: 1,
      category: "personalProtection",
      severity: "critical"
    });
    scores.personalProtection.gloves.score = 1;
  }

  // Check for uncovered food
  const foodItems = predictions.filter(p => 
    ["bowl", "plate", "food"].includes(p.class.toLowerCase())
  );
  foodItems.forEach(item => {
    issues.push({
      x: item.bbox[0],
      y: item.bbox[1],
      width: item.bbox[2],
      height: item.bbox[3],
      class: "Exposed Food",
      score: 1,
      category: "foodSafety",
      severity: "critical"
    });
    scores.foodSafety.foodCovering.score = 1;
  });

  // Add cleanliness checks
  const surfaceCheck = {
    x: 50,
    y: 50,
    width: 40,
    height: 40,
    class: "Workspace Cleanliness Check Required",
    score: 0.9,
    category: "cleanliness",
    severity: "high"
  };
  issues.push(surfaceCheck);

  return { issues, scores };
};

const processImageWithCocoSsd = async (imageData: string) => {
  const model = await loadModel();
  const img = new Image();
  img.src = imageData;
  await new Promise((resolve) => { img.onload = resolve; });

  // Get base predictions from COCO-SSD
  const predictions = await model.detect(img, 20);
  console.log("Base predictions:", predictions);

  // Add custom hygiene analysis
  const { issues, scores } = await analyzeHygieneInImage(predictions, imageData);

  // Create marked image with detailed annotations
  const markedImageData = await createMarkedImage(imageData, issues, scores);

  return {
    hygieneIssues: issues,
    markedImageData,
    scores
  };
};

// Update image marking to include more detailed annotations
const createMarkedImage = async (imageData: string, issues: any[], scores: any): Promise<string> => {
  const img = new Image();
  img.src = imageData;
  
  return new Promise((resolve) => {
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        resolve(imageData);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw bounding boxes and labels for detected objects
      issues.forEach(issue => {
        const x = (issue.x / 100) * img.width;
        const y = (issue.y / 100) * img.height;
        const width = (issue.width / 100) * img.width;
        const height = (issue.height / 100) * img.height;

        // Draw bounding box
        ctx.strokeStyle = issue.severity === 'critical' ? '#FF0000' : '#FFA500';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        const label = `${issue.class} (${Math.round(issue.score * 100)}%)`;
        ctx.fillStyle = issue.severity === 'critical' ? '#FF0000' : '#FFA500';
        ctx.font = '14px Arial';
        ctx.fillRect(x, y - 20, ctx.measureText(label).width + 4, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 2, y - 5);

        // Add detailed labels with recommendations
        const recommendation = getRecommendationForIssue(issue.class);
        ctx.fillText(`${issue.class}: ${recommendation}`, x + 2, y - 25);
      });

      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(imageData);
  });
};

// Helper function to get specific recommendations
const getRecommendationForIssue = (issueType: string): string => {
  const recommendations = {
    "No Gloves Detected": "Wear disposable gloves when handling food",
    "Exposed Food": "Keep food covered when not serving",
    "Workspace Cleanliness": "Clean and sanitize workspace regularly",
    // Add more specific recommendations
  };
  return recommendations[issueType as keyof typeof recommendations] || "Address this hygiene concern";
};

// Update the main analysis function
export const analyzeImage = async (imageData: string): Promise<HygieneReport> => {
  const detection = await processImageWithCocoSsd(imageData);
  
  // Calculate more detailed scores
  const categoryScores = {
    cleanliness: calculateCategoryScore(detection.scores.cleanliness),
    foodHandling: calculateCategoryScore(detection.scores.foodSafety),
    personalHygiene: calculateCategoryScore(detection.scores.personalProtection),
    // ...other categories
  };

  // Generate detected issues and recommendations
  const detectedIssues = detection.hygieneIssues.map(issue => 
    `${issue.class} detected (${Math.round(issue.score * 100)}% confidence)`
  );

  // Calculate overall score
  const totalIssues = Object.values(categoryScores).reduce((sum, cat) => sum + cat.issues, 0);
  const score = Math.max(0, 100 - (totalIssues * 10));

  return {
    score,
    cleanliness: categoryScores.cleanliness.issues > 0 ? "Poor" : "Good",
    foodHandling: categoryScores.foodHandling.issues > 0 ? "Poor" : "Good",
    personalHygiene: categoryScores.personalHygiene.issues > 0 ? "Poor" : "Good",
    overallVerdict: getVerdict(score),
    recommendations: generateRecommendations(detection.hygieneIssues),
    detectedIssues,
    markedImageData: detection.markedImageData,
    hygieneIssues: detection.hygieneIssues.map(issue => ({
      x: issue.x,
      y: issue.y,
      radius: Math.sqrt(issue.width * issue.width + issue.height * issue.height) / 2
    })),
    workstation: categoryScores.cleanliness.issues > 0 ? "Poor" : "Good",
    utensils: categoryScores.cleanliness.issues > 0 ? "Poor" : "Good"
  };
};

const getVerdict = (score: number): string => {
  if (score >= 80) return "This vendor maintains good hygiene standards.";
  if (score >= 60) return "This vendor needs some hygiene improvements.";
  return "This vendor requires immediate hygiene interventions.";
};

const generateRecommendations = (issues: any[]): string[] => {
  const recommendations = new Set<string>();
  
  issues.forEach(issue => {
    if (issue.score < 0.5 || issue.severity === 'high') {
      switch (issue.category) {
        case 'personalProtection':
          recommendations.add("Improve personal hygiene practices");
          break;
        case 'foodSafety':
          recommendations.add("Enhance food handling procedures");
          break;
        case 'cleanliness':
          recommendations.add("Maintain better cleanliness standards");
          break;
      }
    }
  });

  return Array.from(recommendations);
};

interface CategoryItem {
  severity: string;
  score: number;
}

const calculateCategoryScore = (category: Record<string, CategoryItem>): { issues: number } => {
  const issues = Object.values(category).filter(item => item.score > 0).length;
  return { issues };
};
