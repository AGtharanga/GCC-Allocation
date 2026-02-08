export const MARKET_CATEGORIES = [
  "Category A", "Category B", "Category C", "Category D", 
  "Category India", "Category Australia", "Category UAE", 
  "Category UK", "Category O"
];

export const MARKET_COUNTRIES = {
  "Category A": ["Belgium", "Brazil", "Canada", "Denmark", "France", "Georgia", "Germany", "Iceland", "Ireland", "Italy", "Luxemburg", "Mauritius", "Mexico", "Morocco", "Netherland", "New Zealand", "Norway", "Poland", "Portugal", "Romania", "Seychelles", "Slovenia", "South Africa", "Spain", "Sweden", "Switzerland", "USA"],
  "Category B": ["Hongkong", "Lebanon", "Malaysia", "Oman", "Singapore"],
  "Category C": ["Bahrain", "Cyprus", "Kuwait", "Qatar", "Saudi Arabia"],
  "Category D": ["Bangladesh", "Bhutan", "Indonesia", "Iran", "Iraq", "Kazakhstan", "Nepal", "Pakistan", "Palestinian", "Philippines", "Thailand"],
  "Category India": ["India"],
  "Category Australia": ["Australia"],
  "Category UAE": ["UAE"],
  "Category UK": ["UK"],
  "Category O": ["Other countries"]
};

export const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DEFAULT_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export const INITIAL_AGENTS = [
  { 
    id: '1', 
    name: 'Alice Johnson', 
    team: 'ALPHA', 
    marketConfigs: [{category: 'Category A', quota: 10}, {category: 'Category B', quota: 5}], 
    marketCurrents: {'Category A': 4}, 
    isPriority: true, 
    isFrozen: false 
  },
  { 
    id: '2', 
    name: 'Bob Smith', 
    team: 'BETA', 
    marketConfigs: [{category: 'Category A', quota: 15}], 
    marketCurrents: {'Category A': 12}, 
    isPriority: false, 
    isFrozen: false 
  },
  { 
    id: '3', 
    name: 'Charlie Davis', 
    team: 'ALPHA', 
    marketConfigs: [{category: 'Category A', quota: 8}], 
    marketCurrents: {'Category A': 8}, 
    isPriority: false, 
    isFrozen: false 
  }
];
