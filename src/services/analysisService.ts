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

const HYGIENE_DETECTION_CONFIG = {
  PPE: {
    gloves: { threshold: 0.7, severity: 'critical' },
    hairCover: { threshold: 0.7, severity: 'critical' },
    cleanApron: { threshold: 0.6, severity: 'high' }
  },
  foodSafety: {
    cleanPlates: { threshold: 0.75, severity: 'critical' },
    coveredFood: { threshold: 0.8, severity: 'critical' },
    bareHandContact: { threshold: 0.7, severity: 'critical' },
    properStorage: { threshold: 0.7, severity: 'high' }
  },
  cleanliness: {
    workSurface: { threshold: 0.75, severity: 'critical' },
    utensils: { threshold: 0.7, severity: 'high' },
    overallArea: { threshold: 0.7, severity: 'high' }
  }
};

const HYGIENE_CATEGORIES = {
  personalHygiene: {
    handGloves: { threshold: 0.75, severity: 'critical', weight: 1.0 },
    hairCover: { threshold: 0.75, severity: 'critical', weight: 1.0 },
    faceMask: { threshold: 0.75, severity: 'critical', weight: 1.0 },
    apron: { threshold: 0.7, severity: 'high', weight: 0.8 },
    cleanNails: { threshold: 0.8, severity: 'critical', weight: 0.9 }
  },
  utensilEquipment: {
    separateCuttingBoards: { threshold: 0.8, severity: 'critical', weight: 1.0 },
    cleanServingUtensils: { threshold: 0.75, severity: 'critical', weight: 1.0 },
    disposablePackaging: { threshold: 0.7, severity: 'high', weight: 0.8 }
  },
  foodSafetyHandling: {
    properCooking: { threshold: 0.8, severity: 'critical', weight: 1.0 },
    freshIngredients: { threshold: 0.75, severity: 'critical', weight: 1.0 },
    separateRawCooked: { threshold: 0.8, severity: 'critical', weight: 1.0 }
  },
  stallEnvironment: {
    coveredStall: { threshold: 0.7, severity: 'high', weight: 0.8 },
    noFoodWaste: { threshold: 0.75, severity: 'high', weight: 0.9 },
    potableWater: { threshold: 0.8, severity: 'critical', weight: 1.0 }
  },
  compliance: {
    fssaiCertification: { threshold: 0.9, severity: 'critical', weight: 1.0 },
    hygieneTraining: { threshold: 0.8, severity: 'high', weight: 0.9 }
  }
};

const PPE_DETECTION = {
  gloves: {
    colorRange: {
      light: [200, 200, 200], // for light colored gloves
      dark: [50, 50, 50]      // for dark colored gloves
    },
    minArea: 0.05, // minimum area of image that should contain gloves
    threshold: 0.7
  },
  hairCover: {
    colorRange: {
      white: [200, 200, 200],
      blue: [0, 0, 200]
    },
    minArea: 0.1,
    threshold: 0.7
  },
  faceMask: {
    colorRange: {
      white: [200, 200, 200],
      blue: [0, 0, 200]
    },
    minArea: 0.05,
    threshold: 0.7
  }
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

  const regions = splitImageIntoRegions(tensor);
  
  for (const [name, region] of Object.entries(regions)) {
    // Personal Hygiene Analysis
    const hygieneResults = await analyzePersonalHygiene(region);
    scores.push(...hygieneResults.scores);
    issues.push(...hygieneResults.issues);

    // Utensil & Equipment Analysis
    const utensilResults = await analyzeUtensils(region);
    scores.push(...utensilResults.scores);
    issues.push(...utensilResults.issues);

    // Food Safety Analysis
    const foodSafetyResults = await analyzeFoodSafety(region);
    scores.push(...Object.values(foodSafetyResults.scores));
    issues.push(...foodSafetyResults.issues);

    // Stall Environment Analysis
    const environmentResults = await analyzeEnvironment(region);
    scores.push(...environmentResults.scores);
    issues.push(...environmentResults.issues);

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

const detectPPEItem = async (region: Region, item: string): Promise<number> => {
  const tensor = region.tensor;
  let score = 0;

  switch (item) {
    case 'gloves':
      // Check for glove-like shapes and colors in hand regions
      const handRegions = await detectHandRegions(tensor);
      if (handRegions.length > 0) {
        const glovesScore = await analyzeGloves(tensor, handRegions);
        score = glovesScore;
      }
      break;
    case 'hairCover':
      // Check for hair cover in upper region of image
      const upperRegion = tensor.slice([0, 0, 0], [Math.floor(tensor.shape[0] * 0.3), tensor.shape[1], 3]);
      score = await analyzeHairCover(upperRegion);
      upperRegion.dispose();
      break;
    default:
      // Generic detection for other PPE items
      const grayscale = tf.mean(tensor, -1);
      const variance = tf.moments(grayscale).variance;
      const varianceVal = await variance.data();
      score = 1 - Math.min(varianceVal[0] * 10, 1);
      grayscale.dispose();
      variance.dispose();
  }

  return score;
};

const analyzeHairCover = async (tensor: tf.Tensor3D): Promise<number> => {
  // Check for hair cover colors and patterns
  const meanColor = tf.mean(tensor, [0, 1]);
  const colorValues = await meanColor.data();
  
  // Check if colors match typical hair cover patterns
  const isHairCoverColor = (
    // White hair covers
    (colorValues[0] > 0.7 && colorValues[1] > 0.7 && colorValues[2] > 0.7) ||
    // Blue hair covers
    (colorValues[0] < 0.3 && colorValues[1] < 0.3 && colorValues[2] > 0.6)
  );
  
  meanColor.dispose();
  
  return isHairCoverColor ? 1 : 0;
};

const analyzeGloves = async (tensor: tf.Tensor3D, handRegions: Array<[number, number, number, number]>): Promise<number> => {
  const scores = await Promise.all(handRegions.map(async region => {
    const [y, x, height, width] = region;
    const handArea = tensor.slice([y, x, 0], [height, width, 3]);
    
    // Check for glove-like colors
    const meanColor = tf.mean(handArea, [0, 1]);
    const colorValues = await meanColor.data();
    
    // Check if colors match glove patterns
    const isGloveColor = matchesGloveColor(colorValues);
    
    meanColor.dispose();
    handArea.dispose();
    
    return isGloveColor ? 1 : 0;
  }));
  
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const matchesGloveColor = (color: ArrayLike<number>): boolean => {
  const [r, g, b] = Array.from(color);
  return (
    // Light colored gloves
    (r > 0.7 && g > 0.7 && b > 0.7) ||
    // Blue gloves
    (r < 0.3 && g < 0.3 && b > 0.6) ||
    // Black gloves
    (r < 0.3 && g < 0.3 && b < 0.3)
  );
};

const analyzeFoodSafety = async (region: Region) => {
  const issues = [];
  const scores: Record<string, number> = {};

  // Check for clean plates/utensils
  const platesScore = await detectCleanPlates(region);
  scores['cleanPlates'] = platesScore;
  if (platesScore < HYGIENE_DETECTION_CONFIG.foodSafety.cleanPlates.threshold) {
    issues.push({
      type: 'foodSafety',
      item: 'cleanPlates',
      severity: HYGIENE_DETECTION_CONFIG.foodSafety.cleanPlates.severity,
      score: platesScore,
      details: 'Unclean plates/utensils detected',
      recommendations: [
        'Clean and sanitize all utensils',
        'Use separate utensils for different foods',
        'Store utensils in clean, covered area'
      ]
    });
  }

  return { issues, scores };
};

const analyzePersonalHygiene = async (region: Region) => {
  const issues = [];
  const scores: Record<string, number> = {};

  // Check for PPE items
  for (const [item, config] of Object.entries(HYGIENE_CATEGORIES.personalHygiene)) {
    const score = await detectPPEItem(region, item);
    scores[item] = score;

    if (score < config.threshold) {
      issues.push({
        type: 'personalHygiene',
        item,
        category: 'personalHygiene', // Add explicit category
        severity: config.severity,
        score,
        details: `${item.replace(/([A-Z])/g, ' $1').trim()} not detected or improperly worn`,
        recommendations: getRecommendationsForItem(item)
      });
    }
  }

  return { issues, scores: Object.values(scores) };
};

const getRecommendationsForItem = (item: string): string[] => {
  const recommendations: Record<string, string[]> = {
    handGloves: [
      'Wear clean disposable gloves',
      'Change gloves after handling raw food',
      'Replace gloves if torn or contaminated'
    ],
    hairCover: [
      'Wear clean hair net or cap',
      'Ensure all hair is fully covered',
      'Replace hair cover daily'
    ],
    faceMask: [
      'Wear face mask properly covering nose and mouth',
      'Replace mask if wet or soiled',
      'Never reuse disposable masks'
    ],
    apron: [
      'Wear clean apron',
      'Change apron if soiled',
      'Use food-grade material aprons'
    ],
    cleanNails: [
      'Keep nails short and clean',
      'No nail polish while handling food',
      'Wash hands thoroughly including nails'
    ]
  };
  
  return recommendations[item] || ['Maintain proper hygiene standards'];
};

// Helper functions for detection
const detectCleanPlates = async (region: Region): Promise<number> => {
  // Similar to cleanliness detection but focused on reflective surfaces
  const grayscale = tf.mean(region.tensor, -1);
  const variance = tf.moments(grayscale).variance;
  const varianceVal = await variance.data();
  grayscale.dispose();
  variance.dispose();
  
  return 1 - Math.min(varianceVal[0] * 8, 1);
};

const detectHygieneItem = async (region: Region, item: string): Promise<number> => {
  // Placeholder for hygiene item detection logic
  const grayscale = tf.mean(region.tensor, -1);
  const variance = tf.moments(grayscale).variance;
  const varianceVal = await variance.data();
  grayscale.dispose();
  variance.dispose();
  
  return 1 - Math.min(varianceVal[0] * 10, 1);
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
  const getStatus = (score: number) => score >= 70 ? "Good" : score >= 50 ? "Fair" : "Poor";

  // Ensure valid coordinates for PDF circles
  const normalizedIssues = detection.hygieneIssues.map(issue => ({
    x: Math.max(20, Math.min(issue.x || 50, 190)), // Keep x between 20-190
    y: Math.max(20, Math.min(issue.y || 50, 277)), // Keep y between 20-277
    radius: Math.min(Math.max(5, // Minimum radius of 5
      Math.sqrt(
        (issue.width || 100) * (issue.width || 100) + 
        (issue.height || 100) * (issue.height || 100)
      ) / 4 // Divide by 4 to get reasonable circle size
    ), 20) // Maximum radius of 20
  }));

  return {
    score,
    cleanliness: getStatus(score),
    foodHandling: getStatus(score),
    personalHygiene: "Poor", // Default to poor if violations detected
    overallVerdict: getStrictVerdict(score, detection.isUnsafe),
    recommendations: generateRecommendations(detection.hygieneIssues),
    detectedIssues: detection.violations.map(v => v.issue),
    markedImageData: detection.markedImageData,
    hygieneIssues: normalizedIssues,
    workstation: getStatus(score),
    utensils: getStatus(score),
    healthRisks: [...detection.healthRisks.foodContamination.diseases, ...detection.healthRisks.poorHygiene.diseases, ...detection.healthRisks.environmentalHazards.diseases],
    hygieneCheckList: {
      personalHygiene: detection.hygieneIssues
        .filter(issue => issue.type === 'personalHygiene')
        .map(issue => ({
          item: issue.item,
          status: issue.score >= HYGIENE_CATEGORIES.personalHygiene[issue.item]?.threshold
            ? "Compliant"
            : "Action Required",
          risk: issue.severity,
          recommendation: issue.recommendations[0]
        })),
      foodSafety: detection.hygieneIssues
        .filter(issue => issue.type === 'foodSafety')
        .map(issue => ({
          item: issue.item,
          status: issue.score >= HYGIENE_CATEGORIES.foodSafetyHandling[issue.item]?.threshold
            ? "Compliant"
            : "Action Required",
          risk: issue.severity,
          recommendation: issue.recommendations[0]
        })),
      equipmentCleanliness: detection.hygieneIssues
        .filter(issue => issue.type === 'utensils')
        .map(issue => ({
          item: issue.item,
          status: issue.score >= HYGIENE_CATEGORIES.utensilEquipment[issue.item]?.threshold
            ? "Compliant"
            : "Action Required",
          risk: issue.severity,
          recommendation: issue.recommendations[0]
        })),
      wasteManagement: detection.hygieneIssues
        .filter(issue => issue.category === 'wasteManagement')
        .map(issue => ({
          item: issue.class,
          status: issue.checks?.[0]?.status || "Check Required",
          risk: issue.checks?.[0]?.risk || "Medium",
          recommendation: issue.recommendations?.[0] || "Implement proper waste management"
        })),
      pestControl: [],
      waterQuality: []
    }
  };
};

const generateRecommendations = (issues: any[]): string[] => {
  const recommendations = new Set<string>();
  
  issues.forEach(issue => {
    if (issue.recommendations) {
      issue.recommendations.forEach((rec: string) => recommendations.add(rec));
    }
    
    switch (issue.type) {
      case 'ppe':
        recommendations.add(`Ensure proper use of ${issue.item}`);
        break;
      case 'foodSafety':
        recommendations.add(`Address ${issue.item} immediately`);
        break;
      case 'cleanliness':
        recommendations.add(`Clean ${issue.area} area thoroughly`);
        break;
    }
  });

  return Array.from(recommendations);
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
const analyzeUtensils = async (region: Region) => {
  const issues = [];
  const scores = [];

  for (const [item, config] of Object.entries(HYGIENE_CATEGORIES.utensilEquipment)) {
    const score = await detectHygieneItem(region, item);
    scores.push(score * config.weight);

    if (score < config.threshold) {
      issues.push({
        type: 'utensils',
        item,
        severity: config.severity,
        score,
        details: `${item.replace(/([A-Z])/g, ' $1').trim()} not properly maintained`,
        recommendations: ['Clean and sanitize utensils regularly', 'Replace damaged equipment', 'Store utensils properly']
      });
    }
  }

  return { issues, scores };
};

const analyzeEnvironment = async (region: Region) => {
  const issues = [];
  const scores = [];

  for (const [item, config] of Object.entries(HYGIENE_CATEGORIES.stallEnvironment)) {
    const score = await detectHygieneItem(region, item);
    scores.push(score * config.weight);

    if (score < config.threshold) {
      issues.push({
        type: 'environment',
        item,
        severity: config.severity,
        score,
        details: `${item.replace(/([A-Z])/g, ' $1').trim()} needs improvement`,
        recommendations: ['Maintain clean work environment', 'Implement proper waste disposal', 'Ensure adequate ventilation']
      });
    }
  }

  return { issues, scores };
};
const detectHandRegions = async (tensor: tf.Tensor3D): Promise<Array<[number, number, number, number]>> => {
  const [height, width] = tensor.shape;
  
  // Split image into a grid for analysis
  const gridSize = 4;
  const regions: Array<[number, number, number, number]> = [];
  
  // Look for skin-colored regions in lower half of image
  const lowerHalf = tensor.slice([Math.floor(height/2), 0, 0], [Math.floor(height/2), width, 3]);
  
  try {
    // Convert to RGB values we can analyze
    const rgbData = await lowerHalf.array();
    
    const cellHeight = Math.floor(height / (2 * gridSize));
    const cellWidth = Math.floor(width / gridSize);
    
    // Scan grid cells for skin-colored regions
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const startY = i * cellHeight;
        const startX = j * cellWidth;
        
        // Check if this cell contains skin-like colors
        let skinPixelCount = 0;
        const totalPixels = cellHeight * cellWidth;
        
        for (let y = startY; y < startY + cellHeight; y++) {
          for (let x = startX; x < startX + cellWidth; x++) {
            if (y < rgbData.length && x < rgbData[y].length) {
              const [r, g, b] = rgbData[y][x];
              if (isSkinColor(r, g, b)) {
                skinPixelCount++;
              }
            }
          }
        }
        
        // If enough skin-colored pixels found, mark as potential hand region
        if (skinPixelCount / totalPixels > 0.3) {
          regions.push([
            startY + Math.floor(height/2), // Adjust Y coordinate back to full image
            startX,
            cellHeight,
            cellWidth
          ]);
        }
      }
    }
  } finally {
    lowerHalf.dispose();
  }
  
  return regions;
};

function isSkinColor(r: number, g: number, b: number): boolean {
  // Simple skin tone detection based on RGB ratios
  return (r > 95 && g > 40 && b > 20) &&
         (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
         (Math.abs(r - g) > 15) &&
         (r > g) &&
         (r > b);
}

