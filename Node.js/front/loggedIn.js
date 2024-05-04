const getMyProfile = async () => {
	const token = localStorage.getItem("token");

	const response = await fetch("http://localhost:3000/getMyProfile", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json();
	let current = new Date();
	current = current.toISOString();
	const start = new Date(data.last_active).getTime();
	const end = new Date(current).getTime();
	const milliseconds = Math.abs(end - start).toString();
	const seconds = parseInt(milliseconds / 1000);
	const minutes = parseInt(seconds / 60);
	const hours = parseInt(minutes / 60);
	const days = parseInt(hours / 24);
	if (days > 1 || hours > 1 || data.id == null) {
		logout();
	} else {
		document.getElementById(
			"welcomeusername"
		).innerHTML = `Welcome, ${data.name}`;
		const id = data.id;

		const last_active = await fetch(`http://localhost:3000/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ last_active: current }),
		});
		localStorage.setItem("last_active", current);
	}
};

document.addEventListener("DOMContentLoaded", async () => {
	if (localStorage.getItem("token") === null) {
		document.getElementById("login").style.display = "block";
		document.getElementById("register").style.display = "block";
		document.getElementById("logout").style.display = "none";
		document.getElementById("welcomeusername").style.display = "none";
		document.getElementById("floating-button").classList.add("deadgebutton");
		console.log("deadge");
	} else {
		document.getElementById("login").style.display = "none";
		document.getElementById("register").style.display = "none";
		document.getElementById("logout").style.display = "block";
		document.getElementById("welcomeusername").style.display = "block";
		await getMyProfile();
	}
});
const logout = async (event) => {
	localStorage.removeItem("token");
	window.location.href = "/front/index.html";
};

document.getElementById("logout").addEventListener("submit", async (event) => {
	event.preventDefault();
	localStorage.removeItem("token");
	window.location.href = "/front/index.html";
});
