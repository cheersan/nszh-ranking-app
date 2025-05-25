type Matrix = number[][];
type StringMatrix = string[][];
type Alternatives = string[];

// Function: Global Concordance Matrix
function electreMethod(dataset: Matrix, P: number[], Q: number[], W: number[]): Matrix {
	const numAlternatives = dataset.length;
	const numCriteria = dataset[0].length;
	const globalConcordance: Matrix = Array.from({ length: numAlternatives }, () =>
		new Array(numAlternatives).fill(0),
	);

	if (P.length !== numCriteria || Q.length !== numCriteria || W.length !== numCriteria) {
		throw new Error('P, Q and W must have same length as number of criteria');
	}

	for (let k = 0; k < numCriteria; k++) {
		for (let i = 0; i < numAlternatives; i++) {
			for (let j = 0; j < numAlternatives; j++) {
				const diff = dataset[j][k] - dataset[i][k];

				if (diff >= P[k]) {
					globalConcordance[i][j] += W[k] * 0;
				} else if (diff < Q[k]) {
					globalConcordance[i][j] += W[k] * 1;
				} else {
					globalConcordance[i][j] += W[k] * ((P[k] - diff) / (P[k] - Q[k]));
				}
			}
		}
	}

	const sumW = W.reduce((sum, w) => sum + w, 0);
	if (sumW !== 0) {
		for (let i = 0; i < numAlternatives; i++) {
			for (let j = 0; j < numAlternatives; j++) {
				globalConcordance[i][j] /= sumW;
			}
		}
	}

	return globalConcordance;
}

// Function: Credibility Matrix
function credibilityMatrix(
	dataset: Matrix,
	globalConcordance: Matrix,
	P: number[],
	V: number[],
): Matrix {
	const numAlternatives = dataset.length;
	const numCriteria = dataset[0].length;
	const credibility: Matrix = globalConcordance.map((row) => [...row]);

	for (let i = 0; i < numAlternatives; i++) {
		for (let j = 0; j < numAlternatives; j++) {
			if (i === j) {
				credibility[i][j] = 0;
				continue;
			}

			let value = 1;

			for (let k = 0; k < numCriteria; k++) {
				const diff = dataset[j][k] - dataset[i][k];
				let discordanceK = 0;

				if (diff < P[k]) {
					discordanceK = 0;
				} else if (diff >= V[k]) {
					discordanceK = 1;
				} else {
					discordanceK = (diff - P[k]) / (V[k] - P[k]);
				}

				if (discordanceK > globalConcordance[i][j]) {
					value *= (1 - discordanceK) / (1 - globalConcordance[i][j]);
				}
			}

			credibility[i][j] *= value;
		}
	}

	return credibility;
}

// Function: Qualification
function qualification(credibility: Matrix): number[] {
	const size = credibility.length;

	const lambdaMax = Math.max(...credibility.flat());

	const lambdaS = 0.3 - 0.15 * lambdaMax;

	const lambdaLCandidates: number[] = credibility.flat().filter((val) => val < lambdaMax - lambdaS);

	const lambdaL: number = lambdaLCandidates.length > 0 ? Math.max(...lambdaLCandidates) : 0;

	const matrixD: Matrix = Array.from({ length: size }, () => new Array(size).fill(0));

	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (
				i !== j &&
				credibility[i][j] > lambdaL &&
				credibility[i][j] > credibility[j][i] + lambdaS
			) {
				matrixD[i][j] = 1;
			}
		}
	}

	const rows: number[] = matrixD.map((row) => row.reduce((sum, val) => sum + val, 0));
	const cols: number[] = new Array(size).fill(0);
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			cols[j] += matrixD[i][j];
		}
	}

	return rows.map((rowSum, i) => rowSum - cols[i]);
}

// Function: Descending Distillation
function destilationDescending(credibility: Matrix): string[] {
	const alts: string[] = Array.from({ length: credibility.length }, (_, i) => `a${i + 1}`);
	const rank: string[] = [];
	let currentCredibility: Matrix = credibility.map((row) => [...row]);

	while (alts.length > 0) {
		const qual: number[] = qualification(currentCredibility);
		const maxQual: number = Math.max(...qual);
		const maxIndices: number[] = qual.reduce(
			(indices: number[], score: number, i: number) =>
				score === maxQual ? [...indices, i] : indices,
			[],
		);

		if (maxIndices.length > 1) {
			let credibilityTie: Matrix = maxIndices.map((i) =>
				maxIndices.map((j) => currentCredibility[i][j]),
			);
			let qualTie: number[] = qualification(credibilityTie);
			let currentIndices: number[] = [...maxIndices];

			while (true) {
				const maxQualTie: number = Math.max(...qualTie);
				const maxTieIndices: number[] = qualTie.reduce(
					(indices: number[], score: number, i: number) =>
						score === maxQualTie ? [...indices, i] : indices,
					[],
				);

				if (maxTieIndices.length === 1 || maxTieIndices.length === currentIndices.length) {
					break;
				}

				credibilityTie = maxTieIndices.map((i) => maxTieIndices.map((j) => credibilityTie[i][j]));
				qualTie = qualification(credibilityTie);
				currentIndices = maxTieIndices.map((i) => currentIndices[i]);
			}

			const maxQualTie: number = Math.max(...qualTie);
			const maxTieIndices: number[] = qualTie.reduce(
				(indices: number[], score: number, i: number) =>
					score === maxQualTie ? [...indices, i] : indices,
				[],
			);

			if (maxTieIndices.length > 1) {
				const tiedAlts: string = maxTieIndices.map((i) => alts[currentIndices[i]]).join('; ');
				rank.push(tiedAlts);

				[...currentIndices]
					.sort((a, b) => b - a)
					.forEach((i) => {
						alts.splice(i, 1);
					});
			} else {
				const winnerIndex: number = currentIndices[maxTieIndices[0]];
				rank.push(alts[winnerIndex]);
				alts.splice(winnerIndex, 1);
			}
		} else {
			const winnerIndex: number = maxIndices[0];
			rank.push(alts[winnerIndex]);
			alts.splice(winnerIndex, 1);
		}

		const toRemove: number[] = maxIndices.length > 1 ? maxIndices : [maxIndices[0]];
		currentCredibility = currentCredibility
			.filter((_, i) => !toRemove.includes(i))
			.map((row) => row.filter((_, j) => !toRemove.includes(j)));
	}

	return rank;
}

// Function: Ascending Distillation
function destilationAscending(credibility: number[][]): string[] {
	let alts: string[] = Array.from({ length: credibility.length }, (_, i) => `a${i + 1}`);

	const rank: string[] = [];

	while (alts.length > 0) {
		const qual: number[] = qualification(credibility);
		const minQual: number = Math.min(...qual);
		let indices: number[] = qual
			.map((value, index) => (value === minQual ? index : -1))
			.filter((index) => index !== -1);

		if (indices.length > 1) {
			let credibilityTie: number[][] = indices.map((i) => indices.map((j) => credibility[i][j]));
			let qualTie: number[] = qualification(credibilityTie);

			while (
				qualTie.filter((q) => q === Math.min(...qualTie)).length > 1 &&
				qualTie.filter((q) => q === Math.min(...qualTie)).length < indices.length
			) {
				const minQualTie: number = Math.min(...qualTie);
				const indexTie: number[] = qualTie
					.map((value, index) => (value === minQualTie ? index : -1))
					.filter((index) => index !== -1);

				indices = indices.filter((_, i) => indexTie.includes(i));

				credibilityTie = indexTie.map((i) => indexTie.map((j) => credibilityTie[i][j]));
				qualTie = qualification(credibilityTie);
			}

			if (qualTie.filter((q) => q === Math.min(...qualTie)).length > 1) {
				const ties: string = indices.map((i) => alts[i]).join('; ');
				rank.push(ties);
				indices.sort((a, b) => b - a).forEach((i) => alts.splice(i, 1));
			} else {
				const indexTie: number = qualTie.indexOf(Math.min(...qualTie));
				const index: number = indices[indexTie];
				rank.push(alts[index]);
				alts.splice(index, 1);
				indices = [index];
			}
		} else {
			const index: number = qual.indexOf(minQual);
			rank.push(alts[index]);
			alts.splice(index, 1);
			indices = [index];
		}

		credibility = credibility
			.filter((_, i) => !indices.includes(i))
			.map((row) => row.filter((_, j) => !indices.includes(j)));
	}

	return rank.reverse();
}

// Function: Pre-Order Matrix
function preOrderMatrix(
	rankD: string[],
	rankA: string[],
	numberOfAlternatives: number = 7,
): string[][] {
	const alts: string[] = Array.from({ length: numberOfAlternatives }, (_, i) => `a${i + 1}`);

	const altsD: number[] = new Array(numberOfAlternatives).fill(0);
	const altsA: number[] = new Array(numberOfAlternatives).fill(0);

	for (let i = 0; i < numberOfAlternatives; i++) {
		for (let j = 0; j < rankD.length; j++) {
			if (rankD[j].includes(alts[i])) {
				altsD[i] = j + 1;
			}
		}
		for (let k = 0; k < rankA.length; k++) {
			if (rankA[k].includes(alts[i])) {
				altsA[i] = k + 1;
			}
		}
	}

	const poString: string[][] = Array.from({ length: numberOfAlternatives }, () =>
		new Array(numberOfAlternatives).fill('-'),
	);

	for (let i = 0; i < numberOfAlternatives; i++) {
		for (let j = 0; j < numberOfAlternatives; j++) {
			if (i < j) {
				if (
					(altsD[i] < altsD[j] && altsA[i] < altsA[j]) ||
					(altsD[i] === altsD[j] && altsA[i] < altsA[j]) ||
					(altsD[i] < altsD[j] && altsA[i] === altsA[j])
				) {
					poString[i][j] = 'P+';
					poString[j][i] = 'P-';
				}
				if (
					(altsD[i] > altsD[j] && altsA[i] > altsA[j]) ||
					(altsD[i] === altsD[j] && altsA[i] > altsA[j]) ||
					(altsD[i] > altsD[j] && altsA[i] === altsA[j])
				) {
					poString[i][j] = 'P-';
					poString[j][i] = 'P+';
				}
				if (altsD[i] === altsD[j] && altsA[i] === altsA[j]) {
					poString[i][j] = 'I';
					poString[j][i] = 'I';
				}
				if (
					(altsD[i] > altsD[j] && altsA[i] < altsA[j]) ||
					(altsD[i] < altsD[j] && altsA[i] > altsA[j])
				) {
					poString[i][j] = 'R';
					poString[j][i] = 'R';
				}
			}
		}
	}

	return poString;
}

export {
	electreMethod,
	credibilityMatrix,
	qualification,
	destilationDescending,
	destilationAscending,
	preOrderMatrix,
};
