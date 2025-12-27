// 从Grep结果中提取CHARTS数组中的所有图表ID
const chartsArray = [
  'systemFeedback', 'bottleneckTheory', 'valueProposition', 'opportunityCost', 
  'mvpThinking', 'buildMeasureLearn', 'butterflyEffect', 'pathDependency', 
  'opportunitySunkCost', 'scarcityAbundance', 'minimalResistance', 'immediateFeedback', 
  'perspectiveShift', 'firstPrincipleAdvanced', 'potentialEnergyAccumulation', 'valueMultiplication', 
  'breakthroughPointThinking', 'valuePremiumThinking', 'essenceThinking', 'reverseThinking', 
  'systemThinking', 'nonLinearThinking', 'nodeControlThinking', 'actionCalibrationThinking', 
  'taskBufferThinking', 'actionTriggerThinking', 'platformLeverageThinking', 'ecologicalFeedbackThinking', 
  'ecologicalValueDepressionThinking', 'symbioticValueLoopThinking', 'ecologicalNiche', 'symbiosisEffect', 
  'multidimensionalCompounding', 'valueDensity', 'cognitiveCircle', 'boundaryBreaking', 
  'redundancyBackup', 'rhythmControl', 'dislocationCompetition', 'networkEffect', 
  'assetizationThinking', 'moatThinking', 'knowledgeActionUnity', 'microHabitCompounding', 
  'barbellStrategy', 'antifragileThinking', 'supplyDemandMismatch', 'leverageThinking', 
  'compoundLeverage', 'valueNetwork', 'thresholdBreakthrough', 'valueAnchorUpgrade', 
  'metacognition', 'firstPrincipleInnovation', 'paradigmShift', 'probabilityRight', 
  'extremeFocus', 'fastIteration', 'minimalResistancePath', 'resultVisualization', 
  'ecologicalNichePositioning', 'valueSymbiosisNetwork', 'ecologicalEmpowerment', 'symbiosisBarrier', 
  'dip', 'dunning', 'jcurve', 'antifragile', 
  'secondcurve', 'compound', 'mining', 'dopamine', 
  'flow', 'windLaw', 'zone', 'woop', 
  'peakEnd', 'valueVenn', 'purpose', 'johariWindow', 
  'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 
  'growthMindset', 'sunkCost', 'pareto', 'swot', 
  'goldenCircle', 'fiveWhys', 'brokenWindow', 'matthewEffect', 
  'feynmanTechnique', 'spacedRepetition', 'probabilityThinking', 'hedgehogPrinciple', 
  'survivorshipBias', 'occamsRazor', 'anchoringEffect', 'tenThousandHours', 
  'zeigarnikEffect', 'grayThinking', 'riaReading', 'feedbackLoop', 
  'eisenhowerAdvanced', 'energyManagement', 'prospectTheory', 'weightedDecisionMatrix', 
  'feedbackPeakLaw', 'environmentDesign', 'frameRefactoring', 'knowledgeCrystallization', 
  'metaLearning', 'crossDomainLearning', 'energySegmentation', 'smartPrinciple'
];

// 从Grep结果中提取renderChart函数中已经实现的图表ID
const implementedCharts = [
  'attributeRadar', 'focusHeatmap', 'mining', 'entropy', 
  'dip', 'dunning', 'jcurve', 'antifragile', 
  'secondcurve', 'flywheel', 'regret', 'energy', 
  'compound', 'dopamine', 'flow', 'zone', 
  'woop', 'windLaw', 'peakEnd', 'valueVenn', 
  'cognitiveOnion', 'learningCycle', 'purpose', 'johariWindow', 
  'footInDoor', 'deliberatePractice', 'foggBehavior', 'eisenhowerMatrix', 
  'growthMindset', 'sunkCost', 'pareto', 'swot', 
  'goldenCircle', 'fiveWhys', 'brokenWindow', 'matthewEffect', 
  'exposureEffect', 'emotionABC', 'endowmentEffect', 'bystanderEffect', 
  'birdcageEffect', 'metacognition', 'transferLearning', 'singleTasking', 
  'parkinsonsLaw', 'nonviolentCommunication', 'reciprocityPrinciple', 'systemFeedback', 
  'bottleneckTheory', 'valueProposition', 'opportunityCost', 'mvpThinking', 
  'buildMeasureLearn', 'butterflyEffect', 'pathDependency', 'opportunitySunkCost', 
  'scarcityAbundance', 'minimalResistance', 'immediateFeedback', 'perspectiveShift', 
  'firstPrincipleAdvanced', 'antifragileThinking', 'supplyDemandMismatch', 'leverageThinking', 
  'reverseEngineering', 'potentialEnergyAccumulation', 'valueMultiplication', 'essenceThinking', 
  'reverseThinking', 'nodeControlThinking', 'actionCalibrationThinking', 'platformLeverageThinking', 
  'ecologicalFeedbackThinking', 'firstPrincipleMigration'
];

// 找出缺失的图表ID
const missingCharts = chartsArray.filter(chartId => !implementedCharts.includes(chartId));

console.log('缺失的图表ID列表：');
missingCharts.forEach((chartId, index) => {
  console.log(`${index + 1}. ${chartId}`);
});

console.log(`\n共缺失 ${missingCharts.length} 个图表`);