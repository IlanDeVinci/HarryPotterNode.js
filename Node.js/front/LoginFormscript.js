const formulaire = document.getElementById("formulaire");
const email = document.getElementById("email");

email.addEventListener("input", (event) => {
	localStorage.setItem("email", event.target.value);
});
email.value = localStorage.getItem("email");
formulaire.addEventListener("submit", async (event) => {
	event.preventDefault();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	const response = await fetch("http://localhost:3000/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	const data = await response.json();

	const token = data.token;

	localStorage.setItem("token", token);
	window.location.href = "/front/profile.html";
});

const getMyProfile = async () => {
	const token = localStorage.getItem("token");

	const response = await fetch("http://localhost:3000/getMyProfile", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json();

	console.log(data);
};
