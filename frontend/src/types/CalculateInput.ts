export type CalculateInput = {
  method: "promethee" | "electre";
  matrix: number[][];
  weights: number[];
  directions: ("min" | "max")[];
  thresholds: {
    q?: number;
    p?: number;
    v?: number;
    functionType?: string;
  }[];

  alternatives: {
    id: number;
    name: string;
    company: string;
  }[];

  criteria: {
    id: number;
    name: string;
    direction: "min" | "max";
  }[];
};
