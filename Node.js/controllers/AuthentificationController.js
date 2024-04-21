const prisma = require("../config/prisma");
const { comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");

class AuthentificationController {
	async login(req, res) {
		try {
			const body = req.body;

			const user = await prisma.user.findUnique({
				where: {
					email: body.email,
				},
			});

			if (user === null) {
				return res.status(404).send({ error: "User not found" });
			}

			const isSamePassword = await comparePassword(
				body.password,
				user.password
			);

			if (!isSamePassword) {
				return res.status(401).send({ error: "Wrong password" });
			}

			const token = generateToken(user);

			// ICI ON GENERE UN TOKEN
			const id = user.id;
			return res.status(200).send({ token, user, id });
		} catch (e) {
			return res.status(500).send({
				message: e.message,
			});
		}
	}

	async logout(req, res) {
		try {
			return res.status(200).send({
				message: "Logged out",
			});
		} catch (e) {
			return res.status(500).send({
				message: e.message,
			});
		}
	}
}

module.exports = new AuthentificationController();
