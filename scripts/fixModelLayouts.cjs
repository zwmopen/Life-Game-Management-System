// Script to fix thinking model layouts by removing grid layouts and consolidating content
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

  // 1. Remove grid styles and related CSS
  visualDesign = visualDesign.replace(/\.grid\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/\.grid-item\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/\.grid-item:hover\s*\{[\s\S]*?\}/gi, '');
  visualDesign = visualDesign.replace(/@media \(max-width: 768px\)\s*\{\s*\.grid\s*\{[\s\S]*?\}\s*\}/gi, '');

  // 2. Extract content from grid items and merge into model-description
  const gridRegex = /<div class="grid">([\s\S]*?)<\/div>/gi;
  const match = gridRegex.exec(visualDesign);
  
  if (match && match[1]) {
    const gridContent = match[1];
    
    // Extract all grid items' content
    const gridItemRegex = /<div class="grid-item">([\s\S]*?)<\/div>/gi;
    let itemsContent = '';
    let matchItem;

    while ((matchItem = gridItemRegex.exec(gridContent)) !== null) {
      itemsContent += matchItem[1];
    }

    // Remove the grid container
    visualDesign = visualDesign.replace(gridRegex, '');
    
    // Insert the extracted content into the model-description
    if (itemsContent) {
      visualDesign = visualDesign.replace(/(<\/div>\s*<\/div>\s*<\/div>)/i, `${itemsContent}$1`);
    }
  }

  return {
    ...model,
    visualDesign
  };
}

// Apply the fix to all models
const fixedModels = models.map(fixModelLayout);

// Save the fixed models back to the file
fs.writeFileSync(modelsPath, JSON.stringify(fixedModels, null, 2), 'utf8');

console.log('Fixed layouts for all thinking models!');
console.log(`Total models processed: ${models.length}`);
