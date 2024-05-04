const prisma = require("../config/prisma");

class TradesController {
	async house(req, res) {
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
			const id = parseInt(req.params.id);
			if (req.body.tab === "activetrades") {
				const posts = await prisma.trade.findMany({
					where: {
						OR: [
							{
								senderId: id,
							},
							{
								receiverId: id,
							},
						],

						OR: [
							{
								status: "active",
							},
							{
								status: "Awaiting confirmation",
							},
						],
					},
					include: {
						sender: true,
						receiver: true,
						senderCard: true,
						receiverCard: true,
					},
				});
				return res.status(201).send(posts);
			} else if (req.body.tab === "completedtrades") {
				const posts = await prisma.trade.findMany({
					where: {
						OR: [
							{
								senderId: id,
							},
							{
								receiverId: id,
							},
						],
						status: "completed",
					},
					include: {
						sender: true,
						receiver: true,
						senderCard: true,
						receiverCard: true,
					},
				});
				return res.status(201).send(posts);
			} else {
				const posts = await prisma.trade.findMany({
					where: {
						OR: [
							{
								senderId: id,
							},
							{
								receiverId: id,
							},
						],
						status: "pending",
					},
					include: {
						sender: true,
						receiver: true,
						senderCard: true,
						receiverCard: true,
					},
				});
				return res.status(201).send(posts);
			}
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async store(req, res) {
		try {
			const post = await prisma.trade.create({
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
			const post = await prisma.trade.findUnique({
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
			const post = await prisma.trade.update({
				where: {
					id: id,
				},

				data: req.body,
			});
			if (post === null) {
				return res.status(404).send("Trade not found");
			}
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
	async destroy(req, res) {
		const id = parseInt(req.params.id);
		try {
			const post = await prisma.trade.delete({
				where: {
					id: id,
				},
			});
			if (post === null) {
				return res.status(404).send("Trade not found");
			}
			return res.status(201).send(post);
		} catch (error) {
			return res.status(500).send({ message: error.message });
		}
	}
}

module.exports = new TradesController();
