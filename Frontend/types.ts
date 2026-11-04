
// export interface ChatMessage {
//   text: string;
//   sender: 'user' | 'bot';
// }

// export interface PredictionParams {
//   temperature: string;
//   dissolvedOxygen: string;
//   ph: string;
//   conductivity: string;
//   bod: string;
//   nitrate: string;
//   fecalColiform: string;
//   totalColiform: string;
// }


export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

export interface PredictionParams {
  temperature: string;
  dissolvedOxygen: string;
  ph: string;
  conductivity: string;
  bod: string;
  nitrate: string;
  fecalColiform: string;
  totalColiform: string;
}

export type WaterParameter = {
  name: string;
  value: string;
  unit: string;
  icon: string;
  options: {
    Low: { range: string; description: string };
    Average: { range: string; description: string };
    High: { range: string; description: string };
  };
};

export type WaterQuality = 'Safe' | 'Moderate' | 'Unsafe';

export interface PredictionResult {
  quality: WaterQuality;
  explanation: string;
}