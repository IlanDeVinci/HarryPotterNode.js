const getProfile = async () => {
	const token = localStorage.getItem("token");

	const response = await fetch("http://localhost:3000/getMyProfile", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json();
	let creationDate = data.created_at
		.toString()
		.replace(/T/, " ")
		.replace(/\..+/, "");
	console.log(data);
	document.querySelector("#character").innerHTML = `
        <h1>${data.name}</h1>
        <div class="normalimgcontainer">
            <a>
                <img class ="normalimg" src=""></img>
            </a>
        </div>
        <h2 class="single">Email: ${data.email}</h2>
        <h2 class="single">Creation Date: ${creationDate}</h2>
    `;
};
if (localStorage.getItem("token") === null) {
	window.location.href = "/front/register.html";
} else {
	getProfile();
}
