import * as tf from "@tensorflow/tfjs";
import { HygieneReport } from "@/components/HygieneReport";

// Define detailed health risks associated with poor hygiene
const healthRisks = {
  foodContamination: {
    diseases: ['Food Poisoning', 'Gastroenteritis', 'Typhoid'],
    preventiveMeasures: [
      'Regular handwashing',
      'Proper food storage',
      'Clean utensils'
    ]
  },
  poorHygiene: {
    diseases: ['Skin Infections', 'Bacterial Infections', 'Fungal Infections'],
    preventiveMeasures: [
      'Personal cleanliness',
      'Clean clothing',
      'Regular sanitization'
    ]
  },
  environmentalHazards: {
    diseases: ['Vector-borne Diseases', 'Respiratory Issues', 'Food-borne Illnesses'],
    preventiveMeasures: [
      'Proper waste management',
      'Pest control',
      'Clean environment'
    ]
  }
};

// Enhanced hygiene detection categories for Indian street food context
const hygieneCategories = {
  personalHygiene: {
    handwashing: { severity: "critical", score: 0, riskLevel: "high" },
    hairCovering: { severity: "critical", score: 0, riskLevel: "high" },
    cleanClothing: { severity: "high", score: 0, riskLevel: "medium" },
    gloves: { severity: "critical", score: 0, riskLevel: "high" },
    personalCleanliness: { severity: "high", score: 0, riskLevel: "medium" }
  },
  foodSafetyHandling: {
    temperatureControl: { severity: "critical", score: 0, riskLevel: "high" },
    crossContamination: { severity: "critical", score: 0, riskLevel: "high" },
    foodCovering: { severity: "critical", score: 0, riskLevel: "high" },
    foodStorage: { severity: "high", score: 0, riskLevel: "high" },
    preparationArea: { severity: "high", score: 0, riskLevel: "medium" }
  },
  waterQuality: {
    cleanWater: { severity: "critical", score: 0, riskLevel: "high" },
    waterStorage: { severity: "high", score: 0, riskLevel: "medium" },
    waterHandling: { severity: "high", score: 0, riskLevel: "medium" }
  },
  equipmentCleanliness: {
    utensilSanitation: { severity: "critical", score: 0, riskLevel: "high" },
    equipmentMaintenance: { severity: "high", score: 0, riskLevel: "medium" },
    storageContainers: { severity: "high", score: 0, riskLevel: "medium" }
  },
  wasteManagement: {
    wasteDisposal: { severity: "high", score: 0, riskLevel: "medium" },
    garbageBins: { severity: "high", score: 0, riskLevel: "medium" },
    areaClean: { severity: "high", score: 0, riskLevel: "medium" }
  },
  pestControl: {
    pestPrevention: { severity: "critical", score: 0, riskLevel: "high" },
    environmentCleanliness: { severity: "high", score: 0, riskLevel: "medium" }
  }
};

// Add image processing constants
const IMAGE_PROCESSING = {
  CLEANLINESS_THRESHOLD: 0.65,
  COLOR_VARIANCE_THRESHOLD: 0.4,
  TEXTURE_COMPLEXITY_THRESHOLD: 0.5,
  REGION_SIZE: [224, 224] // Standard input size
};

interface Region {
  tensor: tf.Tensor3D;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface RegionMap {
  [key: string]: Region;
}

// Add missing splitImageIntoRegions function
const splitImageIntoRegions = (tensor: tf.Tensor3D): RegionMap => {
  const [height, width] = tensor.shape;
  const regions: RegionMap = {
    top: {
      tensor: tensor.slice([0, 0, 0], [Math.floor(height / 3), width, 3]),
      position: { x: 0, y: 0, width: width, height: Math.floor(height / 3) }
    },
    middle: {
      tensor: tensor.slice([Math.floor(height / 3), 0, 0], [Math.floor(height / 3), width, 3]),
      position: { x: 0, y: Math.floor(height / 3), width: width, height: Math.floor(height / 3) }
    },
    bottom: {
      tensor: tensor.slice([Math.floor(height * 2 / 3), 0, 0], [Math.floor(height / 3), width, 3]),
      position: { x: 0, y: Math.floor(height * 2 / 3), width: width, height: Math.floor(height / 3) }
    }
  };
  return regions;
};

// Add missing analyzeColorPatterns function
const analyzeColorPatterns = async (region: Region) => {
  const rgbMean = tf.mean(region.tensor, [0, 1]);
  const variance = tf.moments(region.tensor, [0, 1]).variance;
  
  const meanValues = await rgbMean.data();
  const varianceValues = await variance.data();
  
  // Check for food-like color patterns
  const isExposed = meanValues.some(v => v > IMAGE_PROCESSING.COLOR_VARIANCE_THRESHOLD) &&
                    varianceValues.some(v => v > IMAGE_PROCESSING.TEXTURE_COMPLEXITY_THRESHOLD);
  
  const score = Math.max(...meanValues) / 255;
  
  // Cleanup
  rgbMean.dispose();
  variance.dispose();
  
  return { isExposed, score };
};

// Add missing calculateOverallScore function
const calculateOverallScore = (scores: number[]): number => {
  if (scores.length === 0) return 0;
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(average * 100);
};

// Enhanced direct image analysis
const processImage = async (imageData: string) => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Fix CORS issues
    img.src = imageData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Convert image to tensor with error handling
    const tensor = tf.tidy(() => {
      const imgTensor = tf.browser.fromPixels(img);
      return tf.div(imgTensor, 255.0) as tf.Tensor3D;
    });

    const { issues, scores } = await analyzeImageRegions(tensor);
    const totalScore = calculateOverallScore(scores);
    const markedImageData = await createMarkedImage(imageData, issues);

    // Ensure cleanup
    tensor.dispose();

    return {
      hygieneIssues: issues,
      markedImageData,
      totalScore,
      violations: issues.map(i => ({
        issue: i.details,
        deduction: i.severity === 'critical' ? 25 : 15
      })),
      isUnsafe: totalScore < 50,
      healthRisks
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

const analyzeImageRegions = async (tensor: tf.Tensor3D) => {
  const issues: any[] = [];
  const scores: number[] = [];

  // Split image into regions
  const regions = splitImageIntoRegions(tensor);
  
  for (const [name, region] of Object.entries(regions)) {
    // Analyze cleanliness
    const cleanliness = await analyzeCleanliness(region);
    scores.push(cleanliness.score);

    if (cleanliness.score < IMAGE_PROCESSING.CLEANLINESS_THRESHOLD) {
      issues.push({
        type: 'cleanliness',
        area: name,
        severity: 'critical',
        score: cleanliness.score,
        details: `Poor cleanliness detected in ${name}`,
        x: region.position?.x || 0,
        y: region.position?.y || 0,
        width: region.position?.width || 100,
        height: region.position?.height || 100
      });
    }

    // Color analysis for food safety
    const colorAnalysis = await analyzeColorPatterns(region);
    if (colorAnalysis.isExposed) {
      issues.push({
        type: 'food_safety',
        area: name,
        severity: 'critical',
        score: colorAnalysis.score,
        details: 'Exposed food detected',
        x: region.position?.x || 0,
        y: region.position?.y || 0,
        width: region.position?.width || 100,
        height: region.position?.height || 100
      });
    }

    // Cleanup
    region.tensor.dispose();
  }

  return { issues, scores };
};

const analyzeCleanliness = async (region: { tensor: tf.Tensor3D }) => {
  // Convert to grayscale
  const grayscale = tf.mean(region.tensor, -1);
  
  // Calculate texture metrics
  const variance = tf.moments(grayscale).variance;
  const varianceVal = await variance.data();
  
  // Calculate cleanliness score
  const score = 1 - Math.min(varianceVal[0] * 10, 1);
  
  // Cleanup
  grayscale.dispose();
  variance.dispose();
  
  return { score, isClean: score > IMAGE_PROCESSING.CLEANLINESS_THRESHOLD };
};

// Update createMarkedImage function to handle missing coordinates
const createMarkedImage = async (imageData: string, issues: any[]): Promise<string> => {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageData;
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        issues.forEach(issue => {
          if (typeof issue.x === 'number' && typeof issue.y === 'number') {
            // Draw issue markers
            ctx.strokeStyle = issue.severity === 'critical' ? '#FF0000' : '#FFA500';
            ctx.lineWidth = 2;
            ctx.strokeRect(
              issue.x,
              issue.y,
              issue.width || 100,
              issue.height || 100
            );

            // Add labels
            ctx.font = '14px Arial';
            ctx.fillStyle = issue.severity === 'critical' ? '#FF0000' : '#FFA500';
            const label = `${issue.type}: ${issue.details}`;
            ctx.fillText(label, issue.x, issue.y - 5);
          }
        });

        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    });
  } catch (error) {
    console.error('Error creating marked image:', error);
    return imageData; // Return original image on error
  }
};

// Update the main analysis function
export const analyzeImage = async (imageData: string): Promise<HygieneReport> => {
  const detection = await processImage(imageData);
  
  const score = detection.totalScore;

  // Determine status based on stricter thresholds
  const getStatus = (score: number) => score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor";

  return {
    score,
    cleanliness: getStatus(score),
    foodHandling: getStatus(score),
    personalHygiene: "Poor", // Default to poor if violations detected
    overallVerdict: getStrictVerdict(score, detection.isUnsafe),
    recommendations: generateRecommendations(detection.hygieneIssues),
    detectedIssues: detection.violations.map(v => v.issue),
    markedImageData: detection.markedImageData,
    hygieneIssues: detection.hygieneIssues.map(issue => ({
      x: issue.x,
      y: issue.y,
      radius: Math.sqrt(issue.width * issue.width + issue.height * issue.height) / 2
    })),
    workstation: getStatus(score),
    utensils: getStatus(score),
    healthRisks: [...detection.healthRisks.foodContamination.diseases, ...detection.healthRisks.poorHygiene.diseases, ...detection.healthRisks.environmentalHazards.diseases],
    hygieneCheckList: {
      personalHygiene: detection.hygieneIssues
        .filter(issue => issue.category === 'personalHygiene')
        .map(issue => ({
          item: issue.class,
          status: issue.checks?.[0]?.status || "Check Required",
          risk: issue.checks?.[0]?.risk || "Medium",
          recommendation: issue.recommendations?.[0] || "Implement proper hygiene measures"
        })),
      foodSafety: detection.hygieneIssues
        .filter(issue => issue.category === 'foodSafetyHandling')
        .map(issue => ({
          item: issue.class,
          status: issue.checks?.[0]?.status || "Check Required",
          risk: issue.checks?.[0]?.risk || "Medium",
          recommendation: issue.recommendations?.[0] || "Implement proper food safety measures"
        })),
      waterQuality: [],
      equipmentCleanliness: [],
      wasteManagement: detection.hygieneIssues
        .filter(issue => issue.category === 'wasteManagement')
        .map(issue => ({
          item: issue.class,
          status: issue.checks?.[0]?.status || "Check Required",
          risk: issue.checks?.[0]?.risk || "Medium",
          recommendation: issue.recommendations?.[0] || "Implement proper waste management"
        })),
      pestControl: []
    }
  };
};

const generateRecommendations = (issues: any[]): string[] => {
  return issues.map(issue => {
    switch (issue.type) {
      case 'cleanliness':
        return `Improve cleanliness in ${issue.area} area`;
      case 'food_safety':
        return 'Ensure proper food coverage and handling';
      default:
        return 'Address identified hygiene concerns';
    }
  });
};

const getStrictVerdict = (score: number, hasAutoFailViolations: boolean): string => {
  if (hasAutoFailViolations) {
    return "IMMEDIATE ACTION REQUIRED: Critical hygiene violations detected. Operations should be suspended until resolved.";
  }
  if (score >= 90) return "Acceptable hygiene standards, but continuous monitoring required.";
  if (score >= 70) return "Multiple hygiene violations detected. Immediate improvements needed.";
  return "Severe hygiene concerns detected. Major improvements required immediately.";
};

interface CategoryItem {
  severity: string;
  score: number;
}

const calculateCategoryScore = (category: Record<string, CategoryItem>): { issues: number } => {
  const issues = Object.values(category).filter(item => item.score > 0).length;
  return { issues };
};
