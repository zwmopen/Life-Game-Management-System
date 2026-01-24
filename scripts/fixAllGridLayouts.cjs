// Script to fix all grid layouts in thinking models
// Using CommonJS format for compatibility
const fs = require('fs');
const path = require('path');

// Read the thinking models JSON file
const modelsPath = path.join(__dirname, '../components/thinkingModels.json');
const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

// Function to fix the layout of a single model
function fixModelLayout(model) {
  if (!model.visualDesign) {
    return model;
  }

  let visualDesign = model.visualDesign;

  // 1. Remove all grid-related CSS
  visualDesign = visualDesign.replace(/\.grid\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/\.grid-item\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/\.grid-item:hover\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/grid\-item\s*h3/gi, 'h3');
  visualDesign = visualDesign.replace(/@media \(max-width: 768px\)\s*\{\s*\.grid\s*\{[\s\S]*?\}\s*\}/gi, '');
  
  // 2. Remove all grid containers and convert grid-items to direct content
  const gridRegex = /<div\s+class="grid"[^>]*>([\s\S]*?)<\/div>/gi;
  visualDesign = visualDesign.replace(gridRegex, '$1');
  
  // 3. Convert grid-items to normal content
  const gridItemRegex = /<div\s+class="grid-item"[^>]*>([\s\S]*?)<\/div>/gi;
  visualDesign = visualDesign.replace(gridItemRegex, '$1');

  return {
    ...model,
    visualDesign
  };
}

// Apply the fix to all models
const fixedModels = models.map(fixModelLayout);

// Save the fixed models back to the file
fs.writeFileSync(modelsPath, JSON.stringify(fixedModels, null, 2), 'utf8');

console.log('Fixed all grid layouts for thinking models!');
console.log(`Total models processed: ${models.length}`);
