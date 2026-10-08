export interface DimensionScore {
  score: number;
  analysis: string;
}

export interface Dimensions {
  colorHarmony: DimensionScore;
  silhouetteProportion: DimensionScore;
  occasionFit: DimensionScore;
  trendAndPersonality: DimensionScore;
  detailsAndAccessories: DimensionScore;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  percentage: number;
  role: '主色' | '輔色' | '點綴色' | string;
}

export interface GarmentItem {
  type: string;
  item: string;
  verdict: string;
}

export interface Recommendation {
  aspect: string;
  tip: string;
  expectedImpact: string;
}

export interface OutfitAnalysis {
  id: string;
  timestamp: number;
  title: string;
  score: number;
  grade: string;
  styleCategory: string;
  vibeKeywords: string[];
  dimensions: Dimensions;
  colorPalette: ColorSwatch[];
  garments: GarmentItem[];
  highlights: string[];
  recommendations: Recommendation[];
  suitableOccasions: string[];
  seasonMatch: string;
  voiceCommentary: string;
  fashionQuote: string;
  imageUrl: string;
}

export type CanvasThemeId = 'noir' | 'atelier' | 'street' | 'minimal';

export interface CanvasTheme {
  id: CanvasThemeId;
  name: string;
  bgGradient: [string, string];
  cardBg: string;
  cardBorder: string;
  textColor: string;
  textMuted: string;
  accentColor: string;
  accentSecondary: string;
  scoreGradient: [string, string];
  radarFill: string;
  radarStroke: string;
}

export type StylistPersonality = 'chic' | 'strict' | 'gentle' | 'trend';

export interface StylistPersonaInfo {
  id: StylistPersonality;
  name: string;
  title: string;
  tagline: string;
  avatar: string;
  accent: string;
}
