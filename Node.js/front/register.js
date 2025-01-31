"use strict";

let passwordInput = document.getElementById("password"); //on récupère l'élément html password
let passCorrect = false;
//fonction qui regarde si le mot de passe est assez sécurisé
function validatePassword() {
	let passwordError = document.getElementById("mdpError");
	let passwordRegex =
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?\\/-]).{8,}$/; //liste de caractères spéciaux

	if (
		passwordRegex.test(passwordInput.value) &&
		passwordInput.value.length >= 8
	) {
		//on regarde si le mot de passe contient les caractères et fait plus que 8 caractères de long
		passwordError.textContent = "";
		passCorrect = true; //le mdp est correct
	} else {
		passCorrect = false; //sinon le mdp est faux
		passwordError.textContent =
			"The password must contain at least 1 lowercase letter, 1 uppercase letter, 1 special character and be 8 characters or longer."; //message d'erreur
	}
}

passwordInput.addEventListener("input", validatePassword);

let mailCorrect = false;
let mailInput = document.getElementById("mail");
//même fonction que pour le mot de passe mais pour l'adresse mail
function validateMail() {
	let mailError = document.getElementById("mailError");
	let mailRegex = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
	if (mailRegex.test(mailInput.value) && mailInput.value.length >= 8) {
		mailError.textContent = "";
		mailCorrect = true;
	} else {
		mailCorrect = false;
		mailError.textContent = `The email adress is not valid.`;
	}
}

mailInput.addEventListener("input", validateMail);

//on check si il y a une adresse mail stockée dans le localstorage et on l'insère dans le input
if (typeof localStorage["email"] !== "undefined") {
	mailInput.value = localStorage["email"];
	validateMail();
}
//on stock l'input de l'adresse mail dans le localstorage dynamiquement
mailInput.addEventListener("input", function () {
	localStorage["email"] = mailInput.value;
});
let nameCorrect = true;
let nameInput;

//même principe que pour le mot de passe et l'adresse mail
function validateName() {
	nameCorrect = false;
	let nameError = document.getElementById("nameError");
	if (nameInput.value.length >= 3) {
		nameError.textContent = "";
		nameCorrect = true;
	} else {
		nameCorrect = false;
		nameError.textContent = `A name must be at least 3 letters long`;
	}
}

if (document.URL.includes("register")) {
	nameInput = document.getElementById("name");
	nameInput.addEventListener("input", validateName);
}

let username, password, email;

//fonction submit qui va collecter les informations et les stocker dans des variables

document.getElementById("submit").addEventListener("click", async function (e) {
	e.preventDefault();
	if (passCorrect && mailCorrect && nameCorrect) {
		password = document.querySelector("#password").value;
		email = document.querySelector("#mail").value;

		if (document.URL.includes("register")) {
			username = document.querySelector("#name").value;
			let seconds = 86385;
			let dateNow = new Date();
			let last_booster = new Date(dateNow.getTime() - seconds * 1000);
			last_booster = last_booster.toISOString();
			const response = await fetch("http://localhost:3000/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					email,
					password,
					last_booster,
				}),
			});
			const data = await response.json();
			const error = data.error;
			if (error === undefined) {
				window.location.href = "/login.html";
				document.getElementById("submitted").innerHTML =
					"You have submitted the form. You can now log in.";
			} else {
				document.getElementById(
					"submitted"
				).innerHTML = `${error}. Please try again.`;
			}
		} else {
			const response = await fetch("http://localhost:3000/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			const id = data.id;
			const error = data.error;
			if (error === undefined || error != null) {
				let current = new Date();
				current = current.toISOString();
				const last_active = await fetch(`http://localhost:3000/users/${id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ last_active: current }),
				});
				localStorage.setItem("last_active", current);
				const token = data.token;
				localStorage.setItem("token", token);
				window.location.href = "/mycards.html";
				document.getElementById("submitted").innerHTML = "You are logged in.";
			} else {
				document.getElementById(
					"submitted"
				).innerHTML = `${error}. Please try again.`;
			}
		}
	} else {
		document.getElementById("submitted").innerHTML = "The form is not correct.";
	}
});
