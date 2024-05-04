"use strict";

//on va chercher le personnage dans l'api
function fetchCharacter() {
	let url = window.location.search;
	let slug = new URLSearchParams(url).get("slug");
	return fetch("https://hp-api.lainocs.fr/characters/" + slug) //on cherche le personnage individuellement avec son slug dans l'api
		.then((response) => response.json());
}
async function displayCharacter() {
	const data = await fetchCharacter(); //on await la réponse de l'api
	if (!data.wand) {
		data.wand = "Nothing"; //on remplace le vide par Nothing pour la clarté
	}
	if (!data.house) {
		data.house = "Nothing";
	}
	if (!data.patronus) {
		data.patronus = "Nothing";
	}
	//on crée une carte avec les attributs du personnage
	document.querySelector("#character").innerHTML = `
        <h1>${data.name}</h1>
        <div class="normalimgcontainer">
            <a>
                <img class ="normalimg" src="${data.image}"></img>
            </a>
        </div>
        <h2 class="single">House: ${data.house}</h2>
        <h2 class="single">Actor: ${data.actor}</h2>
        <h2 class="single">Blood: ${data.blood}</h2>
        <h2 class="single">Patronus: ${data.patronus}</h2>
        <h2 class="single">Role: ${data.role}</h2>
        <h2 class="single">Wand: ${data.wand}</h2>

        <a class="back hide" href="javascript: history.go(-1)">Back</a>
    `;
	postToRaspberry(data.house);
	document.getElementById("pagetitle").innerHTML = data.name;
}

async function postToRaspberry(house) {
	const data = await fetch("http://localhost:3000/", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ house: house }),
	});
}
displayCharacter();
