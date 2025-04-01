// Analysis service using TensorFlow.js for hygiene detection

import { HygieneReport } from "@/components/HygieneReport";
import * as tf from '@tensorflow/tfjs';

// Load the TensorFlow.js model
let model: tf.GraphModel | null = null;

const loadModel = async () => {
  if (model) return model;
  
  try {
    // In a real application, this would be a path to your trained model
    // For now, we'll simulate the model loading
    console.log('Loading TensorFlow.js model...');
    // model = await tf.loadGraphModel('YOUR_MODEL_PATH/model.json');
    
    // Model initialization simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Model loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load model:', error);
    return null;
  }
};

// Process image with TensorFlow.js and mark detected issues on the image
const processImageWithTensorFlow = async (imageData: string): Promise<any> => {
  try {
    await loadModel();
    
    // Simulated hygiene detection results
    // In a real application, this would process the image with the loaded model
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate detection results with probabilities
    // These would be the actual detection results from your model
    const detectionResults = {
      noGloves: Math.random() > 0.5,
      noHairCover: Math.random() > 0.5,
      uncleanSurface: Math.random() > 0.5,
      improperFoodHandling: Math.random() > 0.4,
      uncleanUtensils: Math.random() > 0.6,
      openFood: Math.random() > 0.5,
      noMask: Math.random() > 0.5,
      dirtyClothing: Math.random() > 0.5,
      exposedTrash: Math.random() > 0.5,
      dirtyUtensils: Math.random() > 0.5,
      improperStorage: Math.random() > 0.5,
      visiblePests: Math.random() > 0.5,
      handDirt: Math.random() > 0.5, // New: Detect visible dirt on hands
      expiredFood: Math.random() > 0.5, // New: Detect expired or stale food
      spillage: Math.random() > 0.5, // New: Detect liquid spills or garbage on the floor
      airQualityPoor: Math.random() > 0.5, // New: Simulate poor air quality detection
      // New Parameters
      improperHandWashing: Math.random() > 0.5, // Detect improper hand washing
      faceTouching: Math.random() > 0.5, // Detect frequent face touching
      uniformStains: Math.random() > 0.5, // Detect stains on uniforms
      longDirtyNails: Math.random() > 0.5, // Detect long or dirty nails
      crossContamination: Math.random() > 0.5, // Detect cross-contamination risks
      improperTemperature: Math.random() > 0.5, // Detect improper food storage temperature
      ingredientSpoilage: Math.random() > 0.5, // Detect spoiled ingredients
      missedCleaning: Math.random() > 0.5, // Detect missed cleaning schedules
      unsterilizedTools: Math.random() > 0.5, // Detect unsterilized tools
      highBacterialLoad: Math.random() > 0.5, // Estimate bacterial load on surfaces
      poorWasteManagement: Math.random() > 0.5, // Detect poor waste management
      poorVentilation: Math.random() > 0.5, // Detect poor air quality or ventilation
      pestControlBreaches: Math.random() > 0.5, // Detect pest control breaches
    };

    // Generate detection points for each issue (in a real app, these would come from the model)
    // For our simulation, we'll create random points
    const detectionPoints = {};
    const imageWidth = 800;  // Assumed width for demonstration
    const imageHeight = 600; // Assumed height for demonstration
    
    Object.entries(detectionResults).forEach(([issue, detected]) => {
      if (detected) {
        detectionPoints[issue] = {
          x: Math.floor(Math.random() * (imageWidth - 100)) + 50,
          y: Math.floor(Math.random() * (imageHeight - 100)) + 50,
          radius: Math.floor(Math.random() * 30) + 20,
        };
      }
    });
    
    // Create a marked image with dotted circles
    const markedImageData = await createMarkedImage(imageData, detectionPoints, detectionResults);
    
    return {
      detectionResults,
      detectionConfidence: {
        noGloves: Math.random() * 0.5 + 0.5,
        noHairCover: Math.random() * 0.5 + 0.5,
        uncleanSurface: Math.random() * 0.5 + 0.5,
        improperFoodHandling: Math.random() * 0.5 + 0.5,
        uncleanUtensils: Math.random() * 0.5 + 0.5,
        openFood: Math.random() * 0.5 + 0.5,
        noMask: Math.random() * 0.5 + 0.5,
        dirtyClothing: Math.random() * 0.5 + 0.5,
        exposedTrash: Math.random() * 0.5 + 0.5,
        dirtyUtensils: Math.random() * 0.5 + 0.5,
        improperStorage: Math.random() * 0.5 + 0.5,
        visiblePests: Math.random() * 0.5 + 0.5,
        handDirt: Math.random() * 0.5 + 0.5, // New parameter
        expiredFood: Math.random() * 0.5 + 0.5, // New parameter
        spillage: Math.random() * 0.5 + 0.5, // New parameter
        airQualityPoor: Math.random() * 0.5 + 0.5, // New parameter
        improperHandWashing: Math.random() * 0.5 + 0.5, // New parameter
        faceTouching: Math.random() * 0.5 + 0.5, // New parameter
        uniformStains: Math.random() * 0.5 + 0.5, // New parameter
        longDirtyNails: Math.random() * 0.5 + 0.5, // New parameter
        crossContamination: Math.random() * 0.5 + 0.5, // New parameter
        improperTemperature: Math.random() * 0.5 + 0.5, // New parameter
        ingredientSpoilage: Math.random() * 0.5 + 0.5, // New parameter
        missedCleaning: Math.random() * 0.5 + 0.5, // New parameter
        unsterilizedTools: Math.random() * 0.5 + 0.5, // New parameter
        highBacterialLoad: Math.random() * 0.5 + 0.5, // New parameter
        poorWasteManagement: Math.random() * 0.5 + 0.5, // New parameter
        poorVentilation: Math.random() * 0.5 + 0.5, // New parameter
        pestControlBreaches: Math.random() * 0.5 + 0.5, // New parameter
      },
      markedImageData,
      hygieneIssues: Object.values(detectionPoints),
    };
  } catch (error) {
    console.error("Error in processImageWithTensorFlow:", error); // Log the error
    throw new Error("Failed to process image with TensorFlow.");
  }
};

// Create an image with dotted circles around detected issues
const createMarkedImage = (imageData: string, detectionPoints: any, detectionResults: any): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get canvas context');
        resolve(imageData);
        return;
      }
      
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Draw dotted circles and labels for each detected issue
      const issueColors = {
        noGloves: '#FF6B6B',         // Red
        noHairCover: '#4ECDC4',      // Teal
        uncleanSurface: '#FFE66D',   // Yellow
        improperFoodHandling: '#FF8811', // Orange
        uncleanUtensils: '#6B5CA5',   // Purple
        openFood: '#72B01D',         // Green
        noMask: '#F038FF',           // Pink
        dirtyClothing: '#A52A2A',    // Brown
        exposedTrash: '#808080',     // Gray
        dirtyUtensils: '#8B0000',    // Dark Red
        improperStorage: '#4682B4',  // Steel Blue
        visiblePests: '#FFD700',     // Gold
        handDirt: '#FF4500',         // Orange Red
        expiredFood: '#8B4513',      // Saddle Brown
        spillage: '#2F4F4F',         // Dark Slate Gray
        airQualityPoor: '#708090',   // Slate Gray
      };
      
      // Map issue keys to readable labels
      const issueLabels = {
        noGloves: 'No Gloves',
        noHairCover: 'No Hair Cover',
        uncleanSurface: 'Unclean Surface',
        improperFoodHandling: 'Improper Food Handling',
        uncleanUtensils: 'Unclean Utensils',
        openFood: 'Exposed Food',
        noMask: 'No Mask',
        dirtyClothing: 'Dirty Clothing',
        exposedTrash: 'Exposed Trash',
        dirtyUtensils: 'Dirty Utensils',
        improperStorage: 'Improper Storage',
        visiblePests: 'Visible Pests',
        handDirt: 'Hand Dirt',
        expiredFood: 'Expired Food',
        spillage: 'Spillage',
        airQualityPoor: 'Poor Air Quality',
      };
      
      Object.entries(detectionResults).forEach(([issue, detected]) => {
        if (detected && detectionPoints[issue]) {
          const point = detectionPoints[issue];
          
          // Draw dotted circle
          ctx.strokeStyle = '#FF0000'; // Red color for dotted circles
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 3]); // Set line to dotted pattern
          ctx.beginPath();
          ctx.arc(point.x, point.y, point.radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]); // Reset line dash
          
          // Add label with red background
          ctx.fillStyle = '#FF0000'; // Red background for labels
          ctx.font = '16px sans-serif';
          const label = issueLabels[issue as keyof typeof issueLabels] || issue;
          const textWidth = ctx.measureText(label).width;
          
          // Position label based on position in the image to avoid going off edges
          let textX = point.x;
          let textY = point.y - point.radius - 10;
          
          // Draw background for text
          ctx.fillRect(textX - 5, textY - 20, textWidth + 10, 25);
          
          // Draw text in white for contrast
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(label, textX, textY);
        }
      });
      
      // Convert canvas back to data URL
      const markedImageData = canvas.toDataURL('image/jpeg');
      resolve(markedImageData);
    };
    
    img.onerror = () => {
      console.error('Error loading image for marking');
      resolve(imageData);
    };
    
    // Set the image source to the original image data
    img.src = imageData;
  });
};

// Generate a report based on detected issues
export const analyzeImage = async (imageData: string): Promise<HygieneReport> => {
  const detection = await processImageWithTensorFlow(imageData);

  // Ensure all hygiene aspects are included
  const cleanliness = detection.detectionResults.uncleanSurface ? "Poor" : "Good";
  const foodHandling = detection.detectionResults.improperFoodHandling || detection.detectionResults.openFood ? "Poor" : "Good";
  const personalHygiene = detection.detectionResults.noGloves || detection.detectionResults.noHairCover || detection.detectionResults.noMask || detection.detectionResults.dirtyClothing || detection.detectionResults.handDirt ? "Poor" : "Good";
  const workstation = detection.detectionResults.uncleanSurface || detection.detectionResults.exposedTrash || detection.detectionResults.spillage ? "Poor" : "Good";
  const utensils = detection.detectionResults.uncleanUtensils || detection.detectionResults.dirtyUtensils ? "Poor" : "Good";

  // Calculate score based on the number of "Poor" indicators
  const poorIndicators = [
    cleanliness,
    foodHandling,
    personalHygiene,
    workstation,
    utensils,
  ].filter((status) => status === "Poor").length;

  const detectedIssues = [];
  if (detection.detectionResults.noGloves) detectedIssues.push("No gloves worn when handling food");
  if (detection.detectionResults.noHairCover) detectedIssues.push("No hair cover/cap worn");
  if (detection.detectionResults.uncleanSurface) detectedIssues.push("Unclean food preparation surface");
  if (detection.detectionResults.improperFoodHandling) detectedIssues.push("Improper food handling technique");
  if (detection.detectionResults.uncleanUtensils) detectedIssues.push("Unclean utensils");
  if (detection.detectionResults.openFood) detectedIssues.push("Food exposed to open air/contaminants");
  if (detection.detectionResults.noMask) detectedIssues.push("No mask worn");
  if (detection.detectionResults.dirtyClothing) detectedIssues.push("Dirty clothing worn by vendor");
  if (detection.detectionResults.exposedTrash) detectedIssues.push("Exposed trash near food preparation area");
  if (detection.detectionResults.dirtyUtensils) detectedIssues.push("Dirty utensils used for food preparation");
  if (detection.detectionResults.improperStorage) detectedIssues.push("Improper storage of food items");
  if (detection.detectionResults.visiblePests) detectedIssues.push("Visible pests near food preparation area");
  if (detection.detectionResults.handDirt) detectedIssues.push("Visible dirt or stains on hands");
  if (detection.detectionResults.expiredFood) detectedIssues.push("Expired or stale food detected");
  if (detection.detectionResults.spillage) detectedIssues.push("Spillage or unclean floors detected");
  if (detection.detectionResults.airQualityPoor) detectedIssues.push("Poor air quality detected near the vendor");
  if (detection.detectionResults.improperHandWashing) detectedIssues.push("Improper hand washing detected");
  if (detection.detectionResults.faceTouching) detectedIssues.push("Frequent face touching detected");
  if (detection.detectionResults.uniformStains) detectedIssues.push("Stains detected on uniforms");
  if (detection.detectionResults.longDirtyNails) detectedIssues.push("Long or dirty nails detected");
  if (detection.detectionResults.crossContamination) detectedIssues.push("Cross-contamination risks detected");
  if (detection.detectionResults.improperTemperature) detectedIssues.push("Improper food storage temperature detected");
  if (detection.detectionResults.ingredientSpoilage) detectedIssues.push("Spoiled or expired ingredients detected");
  if (detection.detectionResults.missedCleaning) detectedIssues.push("Missed cleaning schedules detected");
  if (detection.detectionResults.unsterilizedTools) detectedIssues.push("Unsterilized tools detected");
  if (detection.detectionResults.highBacterialLoad) detectedIssues.push("High bacterial load detected on surfaces");
  if (detection.detectionResults.poorWasteManagement) detectedIssues.push("Poor waste management practices detected");
  if (detection.detectionResults.poorVentilation) detectedIssues.push("Poor ventilation or air quality detected");
  if (detection.detectionResults.pestControlBreaches) detectedIssues.push("Pest control breaches detected");

  const score = Math.max(0, 100 - detectedIssues.length * 15);

  const overallVerdict = score >= 80
    ? "This vendor is safe and maintains good hygiene practices with minor improvements needed."
    : score >= 60
    ? "This vendor is moderately safe but requires several hygiene improvements."
    : "This vendor is unsafe and has significant hygiene concerns requiring immediate attention.";

  const recommendations = [
    ...(detection.detectionResults.noGloves ? ["Wear gloves when handling food."] : []),
    ...(detection.detectionResults.noHairCover ? ["Use a hair cover/cap to prevent contamination."] : []),
    ...(detection.detectionResults.uncleanSurface ? ["Clean and sanitize food preparation surfaces regularly."] : []),
    ...(detection.detectionResults.improperFoodHandling ? ["Follow proper food handling procedures."] : []),
    ...(detection.detectionResults.uncleanUtensils ? ["Clean utensils thoroughly before use."] : []),
    ...(detection.detectionResults.openFood ? ["Cover food to prevent contamination."] : []),
    ...(detection.detectionResults.noMask ? ["Wear a mask to maintain hygiene."] : []),
    ...(detection.detectionResults.dirtyClothing ? ["Ensure clean clothing is worn during food preparation."] : []),
    ...(detection.detectionResults.exposedTrash ? ["Remove trash from food preparation areas."] : []),
    ...(detection.detectionResults.dirtyUtensils ? ["Ensure utensils are cleaned and sanitized before use."] : []),
    ...(detection.detectionResults.improperStorage ? ["Store food items properly to avoid contamination."] : []),
    ...(detection.detectionResults.visiblePests ? ["Implement pest control measures to ensure hygiene."] : []),
    ...(detection.detectionResults.handDirt ? ["Wash hands thoroughly before handling food."] : []),
    ...(detection.detectionResults.expiredFood ? ["Dispose of expired or stale food immediately."] : []),
    ...(detection.detectionResults.spillage ? ["Clean up spills and maintain clean floors."] : []),
    ...(detection.detectionResults.airQualityPoor ? ["Improve air quality by avoiding smoke or harmful gases near the stall."] : []),
    ...(detection.detectionResults.improperHandWashing ? ["Ensure proper hand washing techniques are followed."] : []),
    ...(detection.detectionResults.faceTouching ? ["Avoid touching the face during food preparation."] : []),
    ...(detection.detectionResults.uniformStains ? ["Ensure uniforms are clean and free of stains."] : []),
    ...(detection.detectionResults.longDirtyNails ? ["Keep nails trimmed and clean to maintain hygiene."] : []),
    ...(detection.detectionResults.crossContamination ? ["Separate raw and cooked food to prevent cross-contamination."] : []),
    ...(detection.detectionResults.improperTemperature ? ["Maintain proper food storage temperatures."] : []),
    ...(detection.detectionResults.ingredientSpoilage ? ["Inspect ingredients for freshness before use."] : []),
    ...(detection.detectionResults.missedCleaning ? ["Follow the cleaning schedule to ensure sanitation."] : []),
    ...(detection.detectionResults.unsterilizedTools ? ["Sterilize tools and equipment before use."] : []),
    ...(detection.detectionResults.highBacterialLoad ? ["Sanitize high-touch surfaces to reduce bacterial load."] : []),
    ...(detection.detectionResults.poorWasteManagement ? ["Implement proper waste management practices."] : []),
    ...(detection.detectionResults.poorVentilation ? ["Improve ventilation to ensure air quality."] : []),
    ...(detection.detectionResults.pestControlBreaches ? ["Seal entry points and implement pest control measures."] : []),
  ];

  return {
    score,
    cleanliness,
    foodHandling,
    personalHygiene,
    workstation,
    utensils,
    overallVerdict,
    recommendations,
    detectedIssues,
    markedImageData: detection.markedImageData,
    hygieneIssues: detection.hygieneIssues,
  };
};
