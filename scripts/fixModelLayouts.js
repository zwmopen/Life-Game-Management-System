// Script to fix thinking model layouts by removing grid layouts and consolidating content
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
  const gridItemRegex = /<div class="grid">([\s\S]*?)<\/div>/gi;
  let gridContent = '';

  visualDesign = visualDesign.replace(gridItemRegex, (match, content) => {
    // Extract all grid items' content
    const gridItemsRegex = /<div class="grid-item">([\s\S]*?)<\/div>/gi;
    let itemsContent = '';
    let matchItem;

    while ((matchItem = gridItemsRegex.exec(content)) !== null) {
      itemsContent += matchItem[1];
    }

    gridContent = itemsContent;
    return ''; // Remove the entire grid container
  });

  // 3. Insert the grid content into the model-description div
  if (gridContent) {
    visualDesign = visualDesign.replace(/(<\/div>\s*<\/div>\s*<\/div>)/i, `${gridContent}$1`);
  }

  // 4. Ensure proper structure - move any content outside model-description into it
  // This handles cases where content is not properly nested
  const textContentRegex = /<div class="text-content">([\s\S]*?)<\/div>/i;
  visualDesign = visualDesign.replace(textContentRegex, (match, content) => {
    // Extract model description and remaining content
    const modelDescRegex = /<div class="model-description">([\s\S]*?)<\/div>/i;
    const remainingContentRegex = /<div class="model-description">[\s\S]*?<\/div>([\s\S]*?)$/i;

    let modelDesc = '';
    let remainingContent = '';

    const modelDescMatch = modelDescRegex.exec(content);
    if (modelDescMatch) {
      modelDesc = modelDescMatch[1];
    }

    const remainingMatch = remainingContentRegex.exec(content);
    if (remainingMatch) {
      remainingContent = remainingMatch[1];
    }

    // Merge remaining content into model description
    if (remainingContent && modelDesc) {
      // Extract the closing div tag of model description
      const modelDescEndRegex = /(<\/div>\s*)$/i;
      modelDesc = modelDesc.replace(modelDescEndRegex, `${remainingContent}$1`);
    }

    // Reconstruct the text content with fixed model description
    return `<div class="text-content">
      ${modelDesc ? `<div class="model-description">${modelDesc}</div>` : ''}
    </div>`;
  });

  // 5. Clean up any empty divs
  visualDesign = visualDesign.replace(/<div[^>]*>\s*<\/div>/gi, '');

  // Update the model with fixed visualDesign
  return {
    ...model,
    visualDesign
  };
}

// 6. Apply the fix to all models
const fixedModels = models.map(fixModelLayout);

// Save the fixed models back to the file
fs.writeFileSync(modelsPath, JSON.stringify(fixedModels, null, 2), 'utf8');

console.log('Fixed layouts for all thinking models!');
console.log(`Total models processed: ${models.length}`);
