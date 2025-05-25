// calculate.ts
import { PreferenceFunctionType, prometheeII } from './promethee';
import {
	electreMethod,
	credibilityMatrix,
	destilationDescending,
	destilationAscending,
	preOrderMatrix,
} from './electre';

export type CalculateInput = {
	method: 'promethee_ii' | 'electre_iii';
	matrix: number[][];
	weights: Record<string, number>;
	directions: ('min' | 'max')[];
	thresholds: Record<
		string,
		{
			q?: number;
			p?: number;
			v?: number;
			function?: string; // only for PROMETHEE
		}
	>;
	alternatives: {
		id: number;
		name: string;
		company: string;
	}[];
	criteria: {
		id: number;
		name: string;
		direction: 'min' | 'max';
	}[];
};

export function calculate(input: CalculateInput): {
	scores: number[];
	intermediate?: any;
} {
	if (input.method === 'promethee_ii') {
		return calculatePromethee(input);
	} else if (input.method === 'electre_iii') {
		return calculateElectre(input);
	} else {
		throw new Error('Unknown method');
	}
}

function calculatePromethee(input: CalculateInput): {
	scores: number[];
	intermediate?: any;
} {
	const { matrix } = input;
	const functionMap: Record<string, PreferenceFunctionType> = {
		Usual: 't1',
		'U-shape': 't2',
		'V-shape': 't3',
		Level: 't4',
		Linear: 't5',
		Gaussian: 't6',
	};

	const Q = input.criteria.map((c) => input.thresholds[c.name]?.q ?? 0);
	const P = input.criteria.map((c) => input.thresholds[c.name]?.p ?? 0);
	const S = input.criteria.map((c) => input.thresholds[c.name]?.v ?? 0);
	const F: PreferenceFunctionType[] = input.criteria.map((c) => {
		const raw = input.thresholds[c.name]?.function;
		const mapped = functionMap[raw ?? ''] ?? 't1'; // если неизвестно — по умолчанию t1
		return mapped;
	});
	const W = input.criteria.map((c) => input.weights[c.name] ?? 0);

	const isMax = input.directions.map((d) => d === 'max');

	const result = prometheeII(matrix, W, Q, S, P, F, isMax);

	const scores = result.ranking
		.sort((a, b) => a.alternative - b.alternative)
		.map((item) => item.netFlow);
	// console.log(Q, P, S, F, W, isMax, result, scores);
	return {
		scores,
		intermediate: result.full,
	};
}

function calculateElectre(input: CalculateInput): {
	scores: number[];
	intermediate?: any;
} {
	const { matrix, alternatives } = input;

	const Q = input.criteria.map((c) => input.thresholds[c.name]?.q ?? 0);
	const P = input.criteria.map((c) => input.thresholds[c.name]?.p ?? 0);
	const V = input.criteria.map((c) => input.thresholds[c.name]?.v ?? 0);
	const W = input.criteria.map((c) => input.weights[c.name] ?? 0);

	const concordance = electreMethod(matrix, P, Q, W);
	const credibility = credibilityMatrix(matrix, concordance, P, V);
	const descending = destilationDescending(credibility);
	const ascending = destilationAscending(credibility);
	const poMatrix = preOrderMatrix(descending, ascending, alternatives.length);
	const scores = poMatrix.map((row) =>
		row.reduce((count, val) => (val === 'P+' ? count + 1 : count), 0),
	);
	// console.log(
	// 	'Матрица согласия:',
	// 	concordance,
	// 	'Матрица доверия:',
	// 	credibility,
	// 	'Нисходящее ранжирование:',
	// 	descending,
	// 	'Восходящее ранжирование:',
	// 	ascending,
	// 	'pomatrix:',
	// 	poMatrix,
	// 	'scores:',
	// 	scores,
	// );

	return {
		scores,
		intermediate: {
			concordance,
			credibility,
			descending,
			ascending,
			poMatrix,
		},
	};
}
