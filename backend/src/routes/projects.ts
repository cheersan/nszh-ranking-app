import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';

const router = Router();

router.get('/:seed', async (req: Request, res: Response) => {
	const project = await prisma.project.findUnique({
		where: { seed: req.params.seed },
	});

	if (!project) {
		res.status(404).json({ error: 'Проект не найден' });
	} else {
		res.json(project);
	}
});

router.post('/', async (req: Request, res: Response) => {
	const {
		seed = uuidv4().slice(0, 8),
		name,
		method,
		alternativeIds,
		criterionIds,
		matrix,
		weights,
		directions,
		thresholds,
		scores,
		intermediateResults,
	} = req.body;

	const saved = await prisma.project.upsert({
		where: { seed },
		update: {
			name,
			method,
			alternativeIds,
			criterionIds,
			matrix,
			weights,
			directions,
			thresholds,
			scores,
			intermediateResults,
		},
		create: {
			seed,
			name,
			method,
			alternativeIds,
			criterionIds,
			matrix,
			weights,
			directions,
			thresholds,
			scores,
			intermediateResults,
		},
	});

	res.json({ success: true, seed: saved.seed });
});

export default router;
