const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/bcrypt");

class UsersController {
	async getMyProfile(req, res) {
		try {
			const user = req.user;
			return res.status(200).send(user);
		} catch (error) {
			return res.status(500).send({
				error: "User not found",
			});
		}
	}
	//app.get(/users)
	async index(req, res) {
		try {
			const users = await prisma.user.findMany();
			return res.status(201).send(users);
		} catch (error) {
			return res.status(500).send({
				message: error.message,
			});
		}
	}
	//app.post(/users)
	async store(req, res) {
		try {
			const body = req.body;
			const user = await prisma.user.create({
				data: {
					name: body.username,
					email: body.email,
					password: await hashPassword(body.password),
					last_booster: body.last_booster,
				},
			});
			return res.status(201).send(user);
		} catch (error) {
			return res.status(500).send({
				error: "Email already exists",
			});
		}
	}
	//app.get (/users/:id)
	async show(req, res) {
		try {
			const id = parseInt(req.params.id);
			const user = await prisma.user.findUnique({
				where: { id: id },
			});
			if (user === null) {
				return res.status(404).send({
					error: "User not found",
				});
			}
			return res.status(200).send(user);
		} catch (error) {
			return res.status(500).send({
				message: error.message,
			});
		}
	}
	//app.put (/users/:id)
	async update(req, res) {
		try {
			const id = req.params.id;
			let hashedPassword = null;
			if (req.body.password !== undefined) {
				hashedPassword = await hashPassword(req.body.password);
			}
			let user = await prisma.user.update({
				where: { id: parseInt(id) },
				data: req.body,
			});
			if (hashedPassword !== null) {
				user = await prisma.user.update({
					where: { id: parseInt(id) },
					data: { password: hashedPassword },
				});
			}
			if (user === null) {
				return res.status(404).send("User not found");
			}
			return res.status(200).send(user);
		} catch (error) {
			return res.status(500).send({
				message: error.message,
			});
		}
	}
	//app.destroy (/users/:id)
	async destroy(req, res) {
		const id = req.params.id;
		const user = await prisma.user.findUnique({
			where: { id: parseInt(id) },
		});

		if (user === null) {
			return res.status(404).send("User not found");
		}

		const deletedUser = await prisma.user.delete({
			where: { id: parseInt(id) },
		});

		return res.status(200).send(deletedUser);
	}
}

module.exports = new UsersController();
