import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts';
import {
  Coins, Trophy, ShoppingBag, CheckCircle, Swords, Flame, 
  Shield, Brain, BicepsFlexed, Sparkles, Users, Plus, X, Crown,
  Edit3, Trash2, Repeat, Zap, ChevronDown, ChevronUp, Mic, Loader2, PackagePlus,
  Gamepad2, Play, Pause, StopCircle, Clock, Archive, ArchiveRestore, Settings, Gift,
  Box, XCircle, Sunset, Moon, Coffee, Dumbbell, BookOpen, Calendar, Check, Target, Pencil,
  Radar as RadarIcon, Container, Filter, Wrench, User, Crosshair, TrendingUp, Lock, Unlock, Skull, ArrowLeft, GripVertical, Star, Package, List, RefreshCw, Dice5, Hammer, Edit2, Layout,
  HelpCircle, Smartphone, Laptop, Shirt, Ticket, Music, Wifi, Video, Square, CheckSquare, Dice1,
  Headphones, Armchair, Scissors, Glasses, Footprints, Utensils, Sofa, Activity, Power, ChevronRight, Sun, Wallet,
  Camera, Tablet, Wind, Fish, Mountain, Home, Car, Heart, Globe, Palette
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Theme, AttributeType, AttributeTypeValue, Habit, Project, SubTask, TaskType, AutoTaskType, Task, DiceState, DiceTask, DiceCategory, DiceHistory, Settings as SettingsType } from '../types';
import CharacterProfile, { CharacterProfileHandle } from './CharacterProfile';
import { GlobalGuideCard, HelpTooltip, helpContent } from './HelpSystem';
import FateGiftModal from './shared/FateGiftModal';
import FateDice from './FateDice';
import ThinkingCenter from './ThinkingCenter';
import { 
  getCurrentTime, getDateString, getTimeString, 
  addTaskToHistory, generateTaskId, getTaskHistory, 
  saveTasks, getTasks, getFilteredTasks, saveCharacter, loadCharacter,
  getTodayTasks, getWeeklyTasks, getMonthlyTasks, getQuarterlyTasks, getYearlyTasks,
  getTotalTasks, getCompletedTasks, getHabitTasks, getProjectTasks,
  getAutoTasks, getRandomTaskColor,
  getAutoTasksFromSettings, formatNumberWithCommas,
  filterTasksByAttribute, getTasksByType, getTasksBySubtype, getTotalTasksByAttribute,
  generateRandomColor, getTasksByCharacterAttribute, getCharacterAttributes, 
  validateTaskData, updateTaskInLocalStorage, generateUniqueId, getCharacter, updateCharacter,
  saveDiceHistory, getDiceHistory, getDiceHistoryByDate,
  getDiceHistoryByCategory, getTotalDiceScore, getDiceStats, saveDiceState, getDiceState,
  saveSettings, getSettings, getTaskFilters, saveTaskFilters, updateTaskFilters,
  getFateGiftFromStorage, saveFateGiftToStorage
} from '../utils';
import { 
  checkImageUrl, checkImageAvailability, loadImageWithTimeout,
  preloadImages, preloadTaskIcons
} from '../utils/imageChecker';
import { 
  toastSuccess, toastError, toastInfo, toastWarning,
  getToastPosition, setToastPosition
} from '../utils/toast';
import { 
  AudioManager, playNotificationSound, playSuccessSound, 
  playErrorSound, playClickSound, stopNotificationSound, initializeAudio
} from '../utils/audioManager';
import { 
  getCategoryById, getRandomMusicByCategory, 
  getDefaultMusicForCategory, getMusicDuration
} from '../utils/soundManager';
import { 
  getSoundEffectsVolume, setSoundEffectsVolume, 
  getBackgroundMusicVolume, setBackgroundMusicVolume,
  getNotificationSoundId, setNotificationSoundId,
  getSuccessSoundId, setSuccessSoundId,
  getErrorSoundId, setErrorSoundId,
  getClickSoundId, setClickSoundId,
  getIsSoundEnabled, setIsSoundEnabled
} from '../utils/secureStorage';
import { 
  saveGlobalSettings, getGlobalSettings, 
  migrateOldSettings, updateGlobalSettings
} from '../utils/secureStorage';
import { 
  getTasksByDateRange, getTaskCountByDate, getStreakCounts, 
  getHabitCompletionRate, getProjectCompletionRate
} from '../utils/statistics';
import { 
  TaskTimer, TaskTimerState, formatTimerDisplay, 
  TimerSettings, getTimerSettings, saveTimerSettings
} from '../utils/taskTimer';
import { 
  getCharacterGrowthRate, getNextLevelThreshold,
  calculateTaskExperience, updateCharacterExperience
} from '../utils/characterGrowth';
import { 
  getAttributeById, getAttributes, getAttributePointsRequired,
  updateCharacterAttributePoints
} from '../utils/attributeSystem';
import { 
  getDiceCategories, getDiceTaskById, getRandomDiceTask,
  getDiceTasksByCategory, saveDiceTasks, getDiceTasks
} from '../utils/diceSystem';
import { 
  generateRandomHabit, generateRandomProject, generateRandomAutoTask,
  generateRandomDiceTask, getRandomTaskName, getRandomTaskDescription,
  getRandomTaskIcon
} from '../utils/taskGenerator';
import { 
  getThemeById, getThemes, getDefaultTheme, saveCurrentTheme,
  getCurrentTheme, applyThemeToDocument
} from '../utils/themeSystem';
import { 
  getAutoTaskSettings, saveAutoTaskSettings, 
  getAutoTaskById, getAutoTaskCategories
} from '../utils/autoTaskSystem';
import { 
  getFateGiftConfig, saveFateGiftConfig, 
  generateRandomFateGift, getFateGiftById
} from '../utils/fateGiftSystem';
import { 
  getTaskTemplates, getTaskTemplateById, 
  saveTaskTemplate, deleteTaskTemplate
} from '../utils/taskTemplateSystem';
import { 
  getTaskGroups, getTaskGroupById, saveTaskGroup, 
  deleteTaskGroup, addTaskToGroup, removeTaskFromGroup
} from '../utils/taskGroupSystem';
import { 
  getShortcuts, saveShortcuts, getShortcutById,
  addShortcut, removeShortcut, updateShortcut
} from '../utils/shortcutSystem';
import { 
  getTaskPriorities, getTaskPriorityById,
  saveTaskPriority, deleteTaskPriority
} from '../utils/taskPrioritySystem';
import { 
  getTaskStatuses, getTaskStatusById,
  saveTaskStatus, deleteTaskStatus
} from '../utils/taskStatusSystem';
import { 
  getTaskTags, getTaskTagById, saveTaskTag,
  deleteTaskTag, addTagToTask, removeTagFromTask
} from '../utils/taskTagSystem';
import { 
  getTaskRecurrenceTypes, getTaskRecurrenceById,
  saveTaskRecurrence, deleteTaskRecurrence
} from '../utils/taskRecurrenceSystem';
import { 
  getTaskReminderTypes, getTaskReminderById,
  saveTaskReminder, deleteTaskReminder
} from '../utils/taskReminderSystem';
import { 
  getTaskDependencies, getTaskDependencyById,
  saveTaskDependency, deleteTaskDependency
} from '../utils/taskDependencySystem';
import { 
  getTaskComments, getTaskCommentById,
  saveTaskComment, deleteTaskComment
} from '../utils/taskCommentSystem';
import { 
  getTaskAttachments, getTaskAttachmentById,
  saveTaskAttachment, deleteTaskAttachment
} from '../utils/taskAttachmentSystem';
import { 
  getTaskAuditLogs, getTaskAuditLogById,
  saveTaskAuditLog, deleteTaskAuditLog
} from '../utils/taskAuditLogSystem';
import { 
  getTaskStatistics, getTaskStatisticsByDateRange,
  getTaskStatisticsByAttribute, getTaskStatisticsByType
} from '../utils/taskStatisticsSystem';
import { 
  getCharacterAchievements, getCharacterAchievementById,
  saveCharacterAchievement, deleteCharacterAchievement,
  unlockCharacterAchievement, checkAchievementConditions
} from '../utils/characterAchievementSystem';
import { 
  getCharacterSkills, getCharacterSkillById,
  saveCharacterSkill, deleteCharacterSkill,
  upgradeCharacterSkill, getSkillProgress
} from '../utils/characterSkillSystem';
import { 
  getCharacterInventory, getCharacterItemById,
  saveCharacterItem, deleteCharacterItem,
  addItemToInventory, removeItemFromInventory,
  useCharacterItem, getInventoryCapacity
} from '../utils/characterInventorySystem';
import { 
  getCharacterQuests, getCharacterQuestById,
  saveCharacterQuest, deleteCharacterQuest,
  startCharacterQuest, completeCharacterQuest,
  updateQuestProgress, checkQuestConditions
} from '../utils/characterQuestSystem';
import { 
  getCharacterSocials, getCharacterSocialById,
  saveCharacterSocial, deleteCharacterSocial,
  addCharacterSocial, removeCharacterSocial,
  updateSocialRelationship
} from '../utils/characterSocialSystem';
import { 
  getCharacterHomes, getCharacterHomeById,
  saveCharacterHome, deleteCharacterHome,
  addCharacterHome, removeCharacterHome,
  upgradeCharacterHome, getHomeUpgrades
} from '../utils/characterHomeSystem';
import { 
  getCharacterWorkplaces, getCharacterWorkplaceById,
  saveCharacterWorkplace, deleteCharacterWorkplace,
  addCharacterWorkplace, removeCharacterWorkplace,
  upgradeCharacterWorkplace, getWorkplaceUpgrades
} from '../utils/characterWorkplaceSystem';
import { 
  getCharacterTravels, getCharacterTravelById,
  saveCharacterTravel, deleteCharacterTravel,
  addCharacterTravel, removeCharacterTravel,
  completeCharacterTravel, getTravelDestinations
} from '../utils/characterTravelSystem';
import { 
  getCharacterEvents, getCharacterEventById,
  saveCharacterEvent, deleteCharacterEvent,
  addCharacterEvent, removeCharacterEvent,
  completeCharacterEvent, getEventTypes
} from '../utils/characterEventSystem';
import { 
  getCharacterCollections, getCharacterCollectionById,
  saveCharacterCollection, deleteCharacterCollection,
  addItemToCollection, removeItemFromCollection,
  completeCharacterCollection, getCollectionItems
} from '../utils/characterCollectionSystem';
import { 
  getCharacterChallenges, getCharacterChallengeById,
  saveCharacterChallenge, deleteCharacterChallenge,
  addCharacterChallenge, removeCharacterChallenge,
  completeCharacterChallenge, getChallengeTypes
} from '../utils/characterChallengeSystem';
import { 
  getCharacterAchievementCategories, getCharacterAchievementCategoryById,
  saveCharacterAchievementCategory, deleteCharacterAchievementCategory
} from '../utils/characterAchievementCategorySystem';
import { 
  getCharacterSkillCategories, getCharacterSkillCategoryById,
  saveCharacterSkillCategory, deleteCharacterSkillCategory
} from '../utils/characterSkillCategorySystem';
import { 
  getCharacterItemCategories, getCharacterItemCategoryById,
  saveCharacterItemCategory, deleteCharacterItemCategory
} from '../utils/characterItemCategorySystem';
import { 
  getCharacterQuestCategories, getCharacterQuestCategoryById,
  saveCharacterQuestCategory, deleteCharacterQuestCategory
} from '../utils/characterQuestCategorySystem';
import { 
  getCharacterSocialCategories, getCharacterSocialCategoryById,
  saveCharacterSocialCategory, deleteCharacterSocialCategory
} from '../utils/characterSocialCategorySystem';
import { 
  getCharacterHomeCategories, getCharacterHomeCategoryById,
  saveCharacterHomeCategory, deleteCharacterHomeCategory
} from '../utils/characterHomeCategorySystem';
import { 
  getCharacterWorkplaceCategories, getCharacterWorkplaceCategoryById,
  saveCharacterWorkplaceCategory, deleteCharacterWorkplaceCategory
} from '../utils/characterWorkplaceCategorySystem';
import { 
  getCharacterTravelCategories, getCharacterTravelCategoryById,
  saveCharacterTravelCategory, deleteCharacterTravelCategory
} from '../utils/characterTravelCategorySystem';
import { 
  getCharacterEventCategories, getCharacterEventCategoryById,
  saveCharacterEventCategory, deleteCharacterEventCategory
} from '../utils/characterEventCategorySystem';
import { 
  getCharacterCollectionCategories, getCharacterCollectionCategoryById,
  saveCharacterCollectionCategory, deleteCharacterCollectionCategory
} from '../utils/characterCollectionCategorySystem';
import { 
  getCharacterChallengeCategories, getCharacterChallengeCategoryById,
  saveCharacterChallengeCategory, deleteCharacterChallengeCategory
} from '../utils/characterChallengeCategorySystem';
import { 
  getGameSettings, saveGameSettings, updateGameSettings,
  getGameVersion, getGameInfo, getGameChangelog,
  checkForGameUpdates, downloadGameUpdate
} from '../utils/gameSettings';
import { 
  getGameStatistics, getGameStatisticsByDateRange,
  getGameStatisticsByCategory, getGameStatisticsByType
} from '../utils/gameStatistics';
import { 
  getGameAchievements, getGameAchievementById,
  saveGameAchievement, deleteGameAchievement,
  unlockGameAchievement, checkGameAchievementConditions
} from '../utils/gameAchievementSystem';
import { 
  getGameLeaderboards, getGameLeaderboardById,
  saveGameLeaderboard, deleteGameLeaderboard,
  updateLeaderboardScore, getLeaderboardEntries,
  getLeaderboardRank, getLeaderboardStats
} from '../utils/gameLeaderboardSystem';
import { 
  getGameTournaments, getGameTournamentById,
  saveGameTournament, deleteGameTournament,
  joinGameTournament, leaveGameTournament,
  startGameTournament, endGameTournament,
  getTournamentParticipants, getTournamentStats
} from '../utils/gameTournamentSystem';
import { 
  getGameClans, getGameClanById,
  saveGameClan, deleteGameClan,
  joinGameClan, leaveGameClan,
  createGameClan, disbandGameClan,
  getClanMembers, getClanStats
} from '../utils/gameClanSystem';
import { 
  getGameItems, getGameItemById,
  saveGameItem, deleteGameItem,
  purchaseGameItem, sellGameItem,
  useGameItem, getGameItemStats
} from '../utils/gameItemSystem';
import { 
  getGameCurrencies, getGameCurrencyById,
  saveGameCurrency, deleteGameCurrency,
  updateCurrencyBalance, getCurrencyStats
} from '../utils/gameCurrencySystem';
import { 
  getGameQuests, getGameQuestById,
  saveGameQuest, deleteGameQuest,
  startGameQuest, completeGameQuest,
  updateGameQuestProgress, checkGameQuestConditions
} from '../utils/gameQuestSystem';
import { 
  getGameEvents, getGameEventById,
  saveGameEvent, deleteGameEvent,
  joinGameEvent, leaveGameEvent,
  startGameEvent, endGameEvent,
  getGameEventParticipants, getGameEventStats
} from '../utils/gameEventSystem';
import { 
  getGameMissions, getGameMissionById,
  saveGameMission, deleteGameMission,
  startGameMission, completeGameMission,
  updateMissionProgress, checkMissionConditions
} from '../utils/gameMissionSystem';
import { 
  getGameAchievementRewards, getGameAchievementRewardById,
  saveGameAchievementReward, deleteGameAchievementReward,
  claimAchievementReward, getAchievementRewardStats
} from '../utils/gameAchievementRewardSystem';
import { 
  getGameQuestRewards, getGameQuestRewardById,
  saveGameQuestReward, deleteGameQuestReward,
  claimQuestReward, getQuestRewardStats
} from '../utils/gameQuestRewardSystem';
import { 
  getGameEventRewards, getGameEventRewardById,
  saveGameEventReward, deleteGameEventReward,
  claimEventReward, getEventRewardStats
} from '../utils/gameEventRewardSystem';
import { 
  getGameMissionRewards, getGameMissionRewardById,
  saveGameMissionReward, deleteGameMissionReward,
  claimMissionReward, getMissionRewardStats
} from '../utils/gameMissionRewardSystem';
import { 
  getGameTournamentRewards, getGameTournamentRewardById,
  saveGameTournamentReward, deleteGameTournamentReward,
  claimTournamentReward, getTournamentRewardStats
} from '../utils/gameTournamentRewardSystem';
import { 
  getGameClanRewards, getGameClanRewardById,
  saveGameClanReward, deleteGameClanReward,
  claimClanReward, getClanRewardStats
} from '../utils/gameClanRewardSystem';
import { 
  getGameItemRewards, getGameItemRewardById,
  saveGameItemReward, deleteGameItemReward,
  claimItemReward, getItemRewardStats
} from '../utils/gameItemRewardSystem';
import { 
  getGameCurrencyRewards, getGameCurrencyRewardById,
  saveGameCurrencyReward, deleteGameCurrencyReward,
  claimCurrencyReward, getCurrencyRewardStats
} from '../utils/gameCurrencyRewardSystem';
import { 
  getGameRewards, getGameRewardById,
  saveGameReward, deleteGameReward,
  claimGameReward, getGameRewardStats
} from '../utils/gameRewardSystem';
import { 
  getGameProgression, getGameProgressionById,
  saveGameProgression, deleteGameProgression,
  updateProgression, getProgressionStats
} from '../utils/gameProgressionSystem';
import { 
  getGameLeveling, getGameLevelingById,
  saveGameLeveling, deleteGameLeveling,
  updateLeveling, getLevelingStats
} from '../utils/gameLevelingSystem';
import { 
  getGameExperience, getGameExperienceById,
  saveGameExperience, deleteGameExperience,
  updateExperience, getExperienceStats
} from '../utils/gameExperienceSystem';
import { 
  getGameSkillTree, getGameSkillById,
  saveGameSkill, deleteGameSkill,
  unlockGameSkill, upgradeGameSkill,
  getSkillTreeStats
} from '../utils/gameSkillSystem';
import { 
  getGameTalentTree, getGameTalentById,
  saveGameTalent, deleteGameTalent,
  unlockGameTalent, upgradeGameTalent,
  getTalentTreeStats
} from '../utils/gameTalentSystem';
import { 
  getGamePerkTree, getGamePerkById,
  saveGamePerk, deleteGamePerk,
  unlockGamePerk, upgradeGamePerk,
  getPerkTreeStats
} from '../utils/gamePerkSystem';
import { 
  getGameStatTree, getGameStatById,
  saveGameStat, deleteGameStat,
  upgradeGameStat, getStatTreeStats
} from '../utils/gameStatSystem';
import { 
  getGameAttributeTree, getGameAttributeById,
  saveGameAttribute, deleteGameAttribute,
  upgradeGameAttribute, getAttributeTreeStats
} from '../utils/gameAttributeSystem';
import { 
  getGameAbilityTree, getGameAbilityById,
  saveGameAbility, deleteGameAbility,
  unlockGameAbility, upgradeGameAbility,
  getAbilityTreeStats
} from '../utils/gameAbilitySystem';
import { 
  getGamePowerTree, getGamePowerById,
  saveGamePower, deleteGamePower,
  unlockGamePower, upgradeGamePower,
  getPowerTreeStats
} from '../utils/gamePowerSystem';
import { 
  getGameSpecializationTree, getGameSpecializationById,
  saveGameSpecialization, deleteGameSpecialization,
  unlockGameSpecialization, upgradeGameSpecialization,
  getSpecializationTreeStats
} from '../utils/gameSpecializationSystem';
import { 
  getGameProfessionTree, getGameProfessionById,
  saveGameProfession, deleteGameProfession,
  unlockGameProfession, upgradeGameProfession,
  getProfessionTreeStats
} from '../utils/gameProfessionSystem';
import { 
  getGameCareerTree, getGameCareerById,
  saveGameCareer, deleteGameCareer,
  unlockGameCareer, upgradeGameCareer,
  getCareerTreeStats
} from '../utils/gameCareerSystem';
import { 
  getGameEducationTree, getGameEducationById,
  saveGameEducation, deleteGameEducation,
  unlockGameEducation, upgradeGameEducation,
  getEducationTreeStats
} from '../utils/gameEducationSystem';
import { 
  getGameHealthTree, getGameHealthById,
  saveGameHealth, deleteGameHealth,
  upgradeGameHealth, getHealthTreeStats
} from '../utils/gameHealthSystem';
import { 
  getGameFitnessTree, getGameFitnessById,
  saveGameFitness, deleteGameFitness,
  upgradeGameFitness, getFitnessTreeStats
} from '../utils/gameFitnessSystem';
import { 
  getGameIntelligenceTree, getGameIntelligenceById,
  saveGameIntelligence, deleteGameIntelligence,
  upgradeGameIntelligence, getIntelligenceTreeStats
} from '../utils/gameIntelligenceSystem';
import { 
  getGameWisdomTree, getGameWisdomById,
  saveGameWisdom, deleteGameWisdom,
  upgradeGameWisdom, getWisdomTreeStats
} from '../utils/gameWisdomSystem';
import { 
  getGameCharismaTree, getGameCharismaById,
  saveGameCharisma, deleteGameCharisma,
  upgradeGameCharisma, getCharismaTreeStats
} from '../utils/gameCharismaSystem';
import { 
  getGameLuckTree, getGameLuckById,
  saveGameLuck, deleteGameLuck,
  upgradeGameLuck, getLuckTreeStats
} from '../utils/gameLuckSystem';
import { 
  getGameCharmTree, getGameCharmById,
  saveGameCharm, deleteGameCharm,
  upgradeGameCharm, getCharmTreeStats
} from '../utils/gameCharmSystem';
import { 
  getGamePersonalityTree, getGamePersonalityById,
  saveGamePersonality, deleteGamePersonality,
  upgradeGamePersonality, getPersonalityTreeStats
} from '../utils/gamePersonalitySystem';
import { 
  getGameTraitTree, getGameTraitById,
  saveGameTrait, deleteGameTrait,
  unlockGameTrait, upgradeGameTrait,
  getTraitTreeStats
} from '../utils/gameTraitSystem';
import { 
  getGameFeatureTree, getGameFeatureById,
  saveGameFeature, deleteGameFeature,
  unlockGameFeature, upgradeGameFeature,
  getFeatureTreeStats
} from '../utils/gameFeatureSystem';
import { 
  getGameAttributePoints, getGameAttributePointsById,
  saveGameAttributePoints, deleteGameAttributePoints,
  updateAttributePoints, getAttributePointsStats
} from '../utils/gameAttributePointsSystem';
import { 
  getGameSkillPoints, getGameSkillPointsById,
  saveGameSkillPoints, deleteGameSkillPoints,
  updateSkillPoints, getSkillPointsStats
} from '../utils/gameSkillPointsSystem';
import { 
  getGameTalentPoints, getGameTalentPointsById,
  saveGameTalentPoints, deleteGameTalentPoints,
  updateTalentPoints, getTalentPointsStats
} from '../utils/gameTalentPointsSystem';
import { 
  getGamePerkPoints, getGamePerkPointsById,
  saveGamePerkPoints, deleteGamePerkPoints,
  updatePerkPoints, getPerkPointsStats
} from '../utils/gamePerkPointsSystem';
import { 
  getGameStatPoints, getGameStatPointsById,
  saveGameStatPoints, deleteGameStatPoints,
  updateStatPoints, getStatPointsStats
} from '../utils/gameStatPointsSystem';
import { 
  getGameAbilityPoints, getGameAbilityPointsById,
  saveGameAbilityPoints, deleteGameAbilityPoints,
  updateAbilityPoints, getAbilityPointsStats
} from '../utils/gameAbilityPointsSystem';
import { 
  getGamePowerPoints, getGamePowerPointsById,
  saveGamePowerPoints, deleteGamePowerPoints,
  updatePowerPoints, getPowerPointsStats
} from '../utils/gamePowerPointsSystem';
import { 
  getGameSpecializationPoints, getGameSpecializationPointsById,
  saveGameSpecializationPoints, deleteGameSpecializationPoints,
  updateSpecializationPoints, getSpecializationPointsStats
} from '../utils/gameSpecializationPointsSystem';
import { 
  getGameProfessionPoints, getGameProfessionPointsById,
  saveGameProfessionPoints, deleteGameProfessionPoints,
  updateProfessionPoints, getProfessionPointsStats
} from '../utils/gameProfessionPointsSystem';
import { 
  getGameCareerPoints, getGameCareerPointsById,
  saveGameCareerPoints, deleteGameCareerPoints,
  updateCareerPoints, getCareerPointsStats
} from '../utils/gameCareerPointsSystem';
import { 
  getGameEducationPoints, getGameEducationPointsById,
  saveGameEducationPoints, deleteGameEducationPoints,
  updateEducationPoints, getEducationPointsStats
} from '../utils/gameEducationPointsSystem';
import { 
  getGameHealthPoints, getGameHealthPointsById,
  saveGameHealthPoints, deleteGameHealthPoints,
  updateHealthPoints, getHealthPointsStats
} from '../utils/gameHealthPointsSystem';
import { 
  getGameFitnessPoints, getGameFitnessPointsById,
  saveGameFitnessPoints, deleteGameFitnessPoints,
  updateFitnessPoints, getFitnessPointsStats
} from '../utils/gameFitnessPointsSystem';
import { 
  getGameIntelligencePoints, getGameIntelligencePointsById,
  saveGameIntelligencePoints, deleteGameIntelligencePoints,
  updateIntelligencePoints, getIntelligencePointsStats
} from '../utils/gameIntelligencePointsSystem';
import { 
  getGameWisdomPoints, getGameWisdomPointsById,
  saveGameWisdomPoints, deleteGameWisdomPoints,
  updateWisdomPoints, getWisdomPointsStats
} from '../utils/gameWisdomPointsSystem';
import { 
  getGameCharismaPoints, getGameCharismaPointsById,
  saveGameCharismaPoints, deleteGameCharismaPoints,
  updateCharismaPoints, getCharismaPointsStats
} from '../utils/gameCharismaPointsSystem';
import { 
  getGameLuckPoints, getGameLuckPointsById,
  saveGameLuckPoints, deleteGameLuckPoints,
  updateLuckPoints, getLuckPointsStats
} from '../utils/gameLuckPointsSystem';
import { 
  getGameCharmPoints, getGameCharmPointsById,
  saveGameCharmPoints, deleteGameCharmPoints,
  updateCharmPoints, getCharmPointsStats
} from '../utils/gameCharmPointsSystem';
import { 
  getGamePersonalityPoints, getGamePersonalityPointsById,
  saveGamePersonalityPoints, deleteGamePersonalityPoints,
  updatePersonalityPoints, getPersonalityPointsStats
} from '../utils/gamePersonalityPointsSystem';
import { 
  getGameTraitPoints, getGameTraitPointsById,
  saveGameTraitPoints, deleteGameTraitPoints,
  updateTraitPoints, getTraitPointsStats
} from '../utils/gameTraitPointsSystem';
import { 
  getGameFeaturePoints, getGameFeaturePointsById,
  saveGameFeaturePoints, deleteGameFeaturePoints,
  updateFeaturePoints, getFeaturePointsStats
} from '../utils/gameFeaturePointsSystem';
import { 
  getGameCurrencyPoints, getGameCurrencyPointsById,
  saveGameCurrencyPoints, deleteGameCurrencyPoints,
  updateCurrencyPoints, getCurrencyPointsStats
} from '../utils/gameCurrencyPointsSystem';
import { 
  getGameItemPoints, getGameItemPointsById,
  saveGameItemPoints, deleteGameItemPoints,
  updateItemPoints, getItemPointsStats
} from '../utils/gameItemPointsSystem';
import { 
  getGameAchievementPoints, getGameAchievementPointsById,
  saveGameAchievementPoints, deleteGameAchievementPoints,
  updateAchievementPoints, getAchievementPointsStats
} from '../utils/gameAchievementPointsSystem';
import { 
  getGameLeaderboardPoints, getGameLeaderboardPointsById,
  saveGameLeaderboardPoints, deleteGameLeaderboardPoints,
  updateLeaderboardPoints, getLeaderboardPointsStats
} from '../utils/gameLeaderboardPointsSystem';
import { 
  getGameTournamentPoints, getGameTournamentPointsById,
  saveGameTournamentPoints, deleteGameTournamentPoints,
  updateTournamentPoints, getTournamentPointsStats
} from '../utils/gameTournamentPointsSystem';
import { 
  getGameClanPoints, getGameClanPointsById,
  saveGameClanPoints, deleteGameClanPoints,
  updateClanPoints, getClanPointsStats
} from '../utils/gameClanPointsSystem';
import { 
  getGameQuestPoints, getGameQuestPointsById,
  saveGameQuestPoints, deleteGameQuestPoints,
  updateQuestPoints, getQuestPointsStats
} from '../utils/gameQuestPointsSystem';
import { 
  getGameEventPoints, getGameEventPointsById,
  saveGameEventPoints, deleteGameEventPoints,
  updateEventPoints, getEventPointsStats
} from '../utils/gameEventPointsSystem';
import { 
  getGameMissionPoints, getGameMissionPointsById,
  saveGameMissionPoints, deleteGameMissionPoints,
  updateMissionPoints, getMissionPointsStats
} from '../utils/gameMissionPointsSystem';
import { 
  getGameRewardPoints, getGameRewardPointsById,
  saveGameRewardPoints, deleteGameRewardPoints,
  updateRewardPoints, getRewardPointsStats
} from '../utils/gameRewardPointsSystem';
import { 
  getGameProgressionPoints, getGameProgressionPointsById,
  saveGameProgressionPoints, deleteGameProgressionPoints,
  updateProgressionPoints, getProgressionPointsStats
} from '../utils/gameProgressionPointsSystem';
import { 
  getGameLevelingPoints, getGameLevelingPointsById,
  saveGameLevelingPoints, deleteGameLevelingPoints,
  updateLevelingPoints, getLevelingPointsStats
} from '../utils/gameLevelingPointsSystem';
import { 
  getGameExperiencePoints, getGameExperiencePointsById,
  saveGameExperiencePoints, deleteGameExperiencePoints,
  updateExperiencePoints, getExperiencePointsStats
} from '../utils/gameExperiencePointsSystem';
import { 
  getGameSkillTreePoints, getGameSkillTreePointsById,
  saveGameSkillTreePoints, deleteGameSkillTreePoints,
  updateSkillTreePoints, getSkillTreePointsStats
} from '../utils/gameSkillTreePointsSystem';
import { 
  getGameTalentTreePoints, getGameTalentTreePointsById,
  saveGameTalentTreePoints, deleteGameTalentTreePoints,
  updateTalentTreePoints, getTalentTreePointsStats
} from '../utils/gameTalentTreePointsSystem';
import { 
  getGamePerkTreePoints, getGamePerkTreePointsById,
  saveGamePerkTreePoints, deleteGamePerkTreePoints,
  updatePerkTreePoints, getPerkTreePointsStats
} from '../utils/gamePerkTreePointsSystem';
import { 
  getGameStatTreePoints, getGameStatTreePointsById,
  saveGameStatTreePoints, deleteGameStatTreePoints,
  updateStatTreePoints, getStatTreePointsStats
} from '../utils/gameStatTreePointsSystem';
import { 
  getGameAttributeTreePoints, getGameAttributeTreePointsById,
  saveGameAttributeTreePoints, deleteGameAttributeTreePoints,
  updateAttributeTreePoints, getAttributeTreePointsStats
} from '../utils/gameAttributeTreePointsSystem';
import { 
  getGameAbilityTreePoints, getGameAbilityTreePointsById,
  saveGameAbilityTreePoints, deleteGameAbilityTreePoints,
  updateAbilityTreePoints, getAbilityTreePointsStats
} from '../utils/gameAbilityTreePointsSystem';
import { 
  getGamePowerTreePoints, getGamePowerTreePointsById,
  saveGamePowerTreePoints, deleteGamePowerTreePoints,
  updatePowerTreePoints, getPowerTreePointsStats
} from '../utils/gamePowerTreePointsSystem';
import { 
  getGameSpecializationTreePoints, getGameSpecializationTreePointsById,
  saveGameSpecializationTreePoints, deleteGameSpecializationTreePoints,
  updateSpecializationTreePoints, getSpecializationTreePointsStats
} from '../utils/gameSpecializationTreePointsSystem';
import { 
  getGameProfessionTreePoints, getGameProfessionTreePointsById,
  saveGameProfessionTreePoints, deleteGameProfessionTreePoints,
  updateProfessionTreePoints, getProfessionTreePointsStats
} from '../utils/gameProfessionTreePointsSystem';
import { 
  getGameCareerTreePoints, getGameCareerTreePointsById,
  saveGameCareerTreePoints, deleteGameCareerTreePoints,
  updateCareerTreePoints, getCareerTreePointsStats
} from '../utils/gameCareerTreePointsSystem';
import { 
  getGameEducationTreePoints, getGameEducationTreePointsById,
  saveGameEducationTreePoints, deleteGameEducationTreePoints,
  updateEducationTreePoints, getEducationTreePointsStats
} from '../utils/gameEducationTreePointsSystem';
import { 
  getGameHealthTreePoints, getGameHealthTreePointsById,
  saveGameHealthTreePoints, deleteGameHealthTreePoints,
  updateHealthTreePoints, getHealthTreePointsStats
} from '../utils/gameHealthTreePointsSystem';
import { 
  getGameFitnessTreePoints, getGameFitnessTreePointsById,
  saveGameFitnessTreePoints, deleteGameFitnessTreePoints,
  updateFitnessTreePoints, getFitnessTreePointsStats
} from '../utils/gameFitnessTreePointsSystem';
import { 
  getGameIntelligenceTreePoints, getGameIntelligenceTreePointsById,
  saveGameIntelligenceTreePoints, deleteGameIntelligenceTreePoints,
  updateIntelligenceTreePoints, getIntelligenceTreePointsStats
} from '../utils/gameIntelligenceTreePointsSystem';
import { 
  getGameWisdomTreePoints, getGameWisdomTreePointsById,
  saveGameWisdomTreePoints, deleteGameWisdomTreePoints,
  updateWisdomTreePoints, getWisdomTreePointsStats
} from '../utils/gameWisdomTreePointsSystem';
import { 
  getGameCharismaTreePoints, getGameCharismaTreePointsById,
  saveGameCharismaTreePoints, deleteGameCharismaTreePoints,
  updateCharismaTreePoints, getCharismaTreePointsStats
} from '../utils/gameCharismaTreePointsSystem';
import { 
  getGameLuckTreePoints, getGameLuckTreePointsById,
  saveGameLuckTreePoints, deleteGameLuckTreePoints,
  updateLuckTreePoints, getLuckTreePointsStats
} from '../utils/gameLuckTreePointsSystem';
import { 
  getGameCharmTreePoints, getGameCharmTreePointsById,
  saveGameCharmTreePoints, deleteGameCharmTreePoints,
  updateCharmTreePoints, getCharmTreePointsStats
} from '../utils/gameCharmTreePointsSystem';
import { 
  getGamePersonalityTreePoints, getGamePersonalityTreePointsById,
  saveGamePersonalityTreePoints, deleteGamePersonalityTreePoints,
  updatePersonalityTreePoints, getPersonalityTreePointsStats
} from '../utils/gamePersonalityTreePointsSystem';
import { 
  getGameTraitTreePoints, getGameTraitTreePointsById,
  saveGameTraitTreePoints, deleteGameTraitTreePoints,
  updateTraitTreePoints, getTraitTreePointsStats
} from '../utils/gameTraitTreePointsSystem';
import { 
  getGameFeatureTreePoints, getGameFeatureTreePointsById,
  saveGameFeatureTreePoints, deleteGameFeatureTreePoints,
  updateFeatureTreePoints, getFeatureTreePointsStats
} from '../utils/gameFeatureTreePointsSystem';