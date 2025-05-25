export type ProjectData = {
  id: number;
  name: string;
  seed: string;
  method: "promethee" | "electre";
  alternativeIds: number[];
  criterionIds: number[];
  matrix: number[][];
  weights: number[];
  directions: ("min" | "max")[];
  thresholds: {
    q?: number;
    p?: number;
    v?: number;
    functionType?: string;
  }[];
  intermediateResults?: any;
  scores: number[];
};
