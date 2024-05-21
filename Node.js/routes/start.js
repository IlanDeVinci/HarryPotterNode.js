const express = require("express");
const UsersController = require("../controllers/UsersController");
const AuthentificationController = require("../controllers/AuthentificationController");
const AuthMiddleware = require("../middlewares/auth");
const CardsController = require("../controllers/CardsController");
const TradesController = require("../controllers/TradesController");

const router = express.Router();

router.get("/users", UsersController.index);

router.post("/users", UsersController.store);

router.get("/users/:id", UsersController.show);

router.put("/users/:id", UsersController.update);

router.delete("/users/:id", UsersController.destroy);

router.get("/cards", CardsController.index);

router.post("/cards", CardsController.store);

router.post("/cards/:id", CardsController.getCards);

router.get("/cards/:id", CardsController.show);

router.put("/cards/:id", CardsController.update);

router.delete("/cards/:id", CardsController.destroy);

router.post("/login", AuthentificationController.login);

router.post("/logout", AuthentificationController.logout);

router.get(
	"/getMyProfile",
	AuthMiddleware.authenticate,
	UsersController.getMyProfile
);

router.post("/trades/:id", TradesController.index);

router.post("/trades", TradesController.store);

router.put("/trades/:id", TradesController.update);

router.post("/house", TradesController.house);

router.delete("/trades/:id", TradesController.destroy);

router.get("/trades/:id", TradesController.show);

router.get(
	"/decrementnewcompleted/:id",
	TradesController.decrementnewcompleted
);

module.exports = router;
