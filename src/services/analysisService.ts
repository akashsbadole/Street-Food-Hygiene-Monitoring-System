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

// Enhanced hygiene object map with more specific categories
const hygieneObjectMap = {
  person: { 
    category: "personalHygiene", 
    severity: "high",
    checks: ["mask", "gloves", "hairNet", "cleanUniform"]
  },
  "dining table": { 
    category: "workstation", 
    severity: "high",
    checks: ["cleanliness", "organization", "crossContamination"]
  },
  bowl: { 
    category: "foodHandling", 
    severity: "high",
    checks: ["covered", "properStorage", "cleanliness"]
  },
  "food": {
    category: "foodHandling",
    severity: "critical",
    checks: ["covered", "temperature", "freshness"]
  },
  sink: {
    category: "cleanliness",
    severity: "high",
    checks: ["handWashing", "utensilCleaning"]
  },
  // Add more specific detections
  "face mask": { category: "personalHygiene", severity: "critical" },
  "gloves": { category: "personalHygiene", severity: "critical" },
  "hair net": { category: "personalHygiene", severity: "high" },
  "food cover": { category: "foodHandling", severity: "critical" },
  "sanitizer": { category: "cleanliness", severity: "high" },
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

// Add custom detection for hygiene-specific items
const detectHygieneItems = async (imageData: string, baseDetections: any[]) => {
  // Simulate additional hygiene-specific detections
  // In a real implementation, this would use a custom-trained model
  const additionalChecks = {
    mask: Math.random() > 0.5,
    gloves: Math.random() > 0.5,
    hairNet: Math.random() > 0.5,
    foodCover: Math.random() > 0.5,
    handWashing: Math.random() > 0.5,
  };

  return {
    ...baseDetections,
    hygieneSpecific: additionalChecks
  };
};

const processImageWithCocoSsd = async (imageData: string) => {
  const model = await loadModel();
  const img = new Image();
  img.src = imageData;
  await new Promise((resolve) => { img.onload = resolve; });

  // Perform object detection
  const predictions = await model.detect(img, 20); // Detect up to 20 objects
  console.log("COCO-SSD predictions:", predictions);

  // Filter and map predictions to hygiene issues
  const hygieneIssues = predictions
    .filter(pred => pred.class in hygieneObjectMap)
    .map(pred => ({
      x: (pred.bbox[0] / img.width) * 100,
      y: (pred.bbox[1] / img.height) * 100,
      width: (pred.bbox[2] / img.width) * 100,
      height: (pred.bbox[3] / img.height) * 100,
      class: pred.class,
      score: pred.score,
      category: hygieneObjectMap[pred.class as keyof typeof hygieneObjectMap].category,
      severity: hygieneObjectMap[pred.class as keyof typeof hygieneObjectMap].severity
    }));

  // Add hygiene-specific detection
  const hygieneDetections = await detectHygieneItems(imageData, predictions);
  
  // Combine all detections
  const allIssues = [...hygieneIssues];
  
  // Add hygiene-specific issues
  if (!hygieneDetections.hygieneSpecific.mask) {
    allIssues.push({
      x: 50,
      y: 50,
      width: 20,
      height: 20,
      class: "Missing Mask",
      score: 1,
      category: "personalHygiene",
      severity: "critical"
    });
  }
  
  // Similar additions for other hygiene items...

  // Create marked image with bounding boxes
  const markedImageData = await createMarkedImage(imageData, allIssues);

  return { hygieneIssues: allIssues, markedImageData };
};

const createMarkedImage = async (imageData: string, issues: any[]): Promise<string> => {
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
        ctx.strokeStyle = issue.severity === 'high' ? '#FF0000' : '#FFA500';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw label
        const label = `${issue.class} (${Math.round(issue.score * 100)}%)`;
        ctx.fillStyle = issue.severity === 'high' ? '#FF0000' : '#FFA500';
        ctx.font = '14px Arial';
        ctx.fillRect(x, y - 20, ctx.measureText(label).width + 4, 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + 2, y - 5);
      });

      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => resolve(imageData);
  });
};

export const analyzeImage = async (imageData: string): Promise<HygieneReport> => {
  const detection = await processImageWithCocoSsd(imageData);
  
  // Calculate category scores based on detected objects
  const categoryScores = {
    cleanliness: { issues: 0 },
    foodHandling: { issues: 0 },
    personalHygiene: { issues: 0 },
    workstation: { issues: 0 },
    utensils: { issues: 0 }
  };

  // Count issues per category
  detection.hygieneIssues.forEach(issue => {
    if (issue.score < 0.5 || issue.severity === 'high') {
      categoryScores[issue.category as keyof typeof categoryScores].issues++;
    }
  });

  // Generate detected issues and recommendations
  const detectedIssues = detection.hygieneIssues.map(issue => 
    `${issue.class} detected (${Math.round(issue.score * 100)}% confidence)`
  );

  // Calculate overall score
  const totalIssues = Object.values(categoryScores).reduce((sum, cat) => sum + cat.issues, 0);
  const score = Math.max(0, 100 - (totalIssues * 10));

  // ...rest of your existing analyzeImage implementation...
  return {
    score,
    cleanliness: categoryScores.cleanliness.issues > 0 ? "Poor" : "Good",
    foodHandling: categoryScores.foodHandling.issues > 0 ? "Poor" : "Good",
    personalHygiene: categoryScores.personalHygiene.issues > 0 ? "Poor" : "Good",
    workstation: categoryScores.workstation.issues > 0 ? "Poor" : "Good",
    utensils: categoryScores.utensils.issues > 0 ? "Poor" : "Good",
    overallVerdict: getVerdict(score),
    recommendations: generateRecommendations(detection.hygieneIssues),
    detectedIssues,
    markedImageData: detection.markedImageData,
    hygieneIssues: detection.hygieneIssues.map(issue => ({
      x: issue.x,
      y: issue.y,
      radius: Math.sqrt(issue.width * issue.width + issue.height * issue.height) / 2
    }))
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
        case 'personalHygiene':
          recommendations.add("Improve personal hygiene practices");
          break;
        case 'foodHandling':
          recommendations.add("Enhance food handling procedures");
          break;
        case 'cleanliness':
          recommendations.add("Maintain better cleanliness standards");
          break;
        case 'workstation':
          recommendations.add("Organize workstation more effectively");
          break;
        case 'utensils':
          recommendations.add("Ensure proper utensil cleanliness and storage");
          break;
      }
    }
  });

  return Array.from(recommendations);
};
