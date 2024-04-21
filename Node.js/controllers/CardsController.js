const prisma = require("../config/prisma");

class CardsController {
	async getCards(req, res) {
		try {
			const posts = await prisma.card.findMany({
				where: {
					ownerId: req.body.id,
				},
				include: {
					owner: true,
				},
			});
			return res.json(posts);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}

	async index(req, res) {
		try {
			const posts = await prisma.card.findMany({
				where: {
					ownerId: req.params.id,
				},
			});
			return res.status(201).send(posts);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async store(req, res) {
		try {
			const post = await prisma.card.create({
				data: req.body,
			});
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async show(req, res) {
		const id = parseInt(req.params.id);
		try {
			const post = await prisma.card.findUnique({
				where: {
					id: id,
				},
			});
			if (post === null) {
				return res.status(404).send("Post not found");
			}
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async update(req, res) {
		const id = parseInt(req.params.id);
		try {
			const post = await prisma.card.update({
				where: {
					id: id,
				},
				data: {
					favorite: req.body.favorite,
					ownerId: req.body.ownerId,
				},
			});
			if (post === null) {
				return res.status(404).send("Post not found");
			}
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async destroy(req, res) {
		const id = parseInt(req.params.id);
		try {
			const post = await prisma.card.delete({
				where: {
					id: id,
				},
			});
			if (post === null) {
				return res.status(404).send("Post not found");
			}
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
}

module.exports = new CardsController();
