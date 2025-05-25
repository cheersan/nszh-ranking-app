export type PreferenceFunctionType = 't1' | 't2' | 't3' | 't4' | 't5' | 't6';

type PrometheeReport = {
	ranking: { alternative: number; netFlow: number }[];
	full?: {
		pdMatrix: number[][];
		phiPlus: number[];
		phiMinus: number[];
	};
};

function distanceMatrix(dataset: number[][], criteria: number, isMax: boolean[]): number[][] {
	const n = dataset.length;
	const distances: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (isMax[criteria]) {
				distances[i][j] = dataset[i][criteria] - dataset[j][criteria];
			} else {
				distances[i][j] = dataset[j][criteria] - dataset[i][criteria];
			}
		}
	}
	return distances;
}

function preferenceDegree(
	dataset: number[][],
	W: number[],
	Q: number[],
	S: number[],
	P: number[],
	F: PreferenceFunctionType[],
	isMax: boolean[],
): number[][] {
	const n = dataset.length;
	const m = dataset[0].length;
	const pdMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

	for (let k = 0; k < m; k++) {
		const distances = distanceMatrix(dataset, k, isMax);

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (i === j) continue;
				const d = distances[i][j];
				let value = 0;

				switch (F[k]) {
					case 't1':
						value = d <= 0 ? 0 : 1;
						break;
					case 't2':
						value = d <= Q[k] ? 0 : 1;
						break;
					case 't3':
						value = d <= 0 ? 0 : d <= P[k] ? d / P[k] : 1;
						break;
					case 't4':
						value = d <= Q[k] ? 0 : d <= P[k] ? 0.5 : 1;
						break;
					case 't5':
						value = d <= Q[k] ? 0 : d <= P[k] ? (d - Q[k]) / (P[k] - Q[k]) : 1;
						break;
					case 't6':
						value = d <= 0 ? 0 : 1 - Math.exp(-(d ** 2) / (2 * S[k] ** 2));
						break;
				}

				pdMatrix[i][j] += W[k] * value;
			}
		}
	}

	// Нормализация на сумму весов
	const weightSum = W.reduce((sum, w) => sum + w, 0);
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			pdMatrix[i][j] /= weightSum;
		}
	}
	return pdMatrix;
}

export function prometheeII(
	dataset: number[][],
	W: number[],
	Q: number[],
	S: number[],
	P: number[],
	F: PreferenceFunctionType[],
	isMax: boolean[],
): PrometheeReport {
	const pd = preferenceDegree(dataset, W, Q, S, P, F, isMax);
	const n = pd.length;

	const phiPlus = new Array(n).fill(0);
	const phiMinus = new Array(n).fill(0);
	const netFlow: { alternative: number; netFlow: number }[] = [];

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i !== j) {
				phiPlus[i] += pd[i][j];
				phiMinus[i] += pd[j][i];
			}
		}
		netFlow.push({ alternative: i + 1, netFlow: phiPlus[i] - phiMinus[i] });
	}

	return {
		ranking: netFlow,
		full: {
			pdMatrix: pd,
			phiPlus,
			phiMinus,
		},
	};
}
