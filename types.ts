export interface BrutalityIndexResponse {
  score: number;
  label: string;
  analysis: string;
}

export type Feature = 'Interpreter' | 'Brutality Index' | 'Grimoire' | 'Archives';

export interface SavedItem {
  id: string;
  feature: Feature;
  input: any;
  result: any;
  timestamp: string;
}
