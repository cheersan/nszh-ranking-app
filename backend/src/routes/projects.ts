import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma';
import { calculate } from '../calculate';

const router = Router();
const dbPath = path.join(__dirname, '../storage/db.json');

function loadDB(): Record<string, any> {
	if (!fs.existsSync(dbPath)) return {};
	return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveDB(data: Record<string, any>) {
	fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

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

router.post('/calculate', (req: Request, res: Response) => {
	try {
		const result = calculate(req.body);
		res.json(result);
	} catch (e) {
		res.status(400).json({ error: (e as Error).message });
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
