const getProfile = async () => {
	const token = localStorage.getItem("token");

	const response = await fetch("http://localhost:3000/getMyProfile", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const data = await response.json();
	let last_active = data.last_active
		.toString()
		.replace(/T/, " ")
		.replace(/\..+/, "");
	let creationDate = data.created_at
		.toString()
		.replace(/T/, " ")
		.replace(/\..+/, "");
	document.querySelector("#character").innerHTML = `
        <h1>${data.name}</h1>
        <div class="normalimgcontainer">
            <a>
                <img class ="normalimg" src=""></img>
            </a>
        </div>
		<h2 class="single">User ID: ${data.id}</h2>
        <h2 class="single">Email: ${data.email}</h2>
		<h2 class="single">Last Active: ${last_active}</h2>
        <h2 class="single">Creation Date: ${creationDate}</h2>
		<h2 class="single">Pity: ${data.pity}</h2>

    `;
	let id = data.id;
	const getCards = await fetch(`http://localhost:3000/cards/${id}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ id: id }),
	});
	cards = await getCards.json();
	await loadCharacters();
	await initCards();
};

const getUserProfile = async () => {
	let params = new URLSearchParams(location.search);
	let id = params.get("id");
	const token = localStorage.getItem("token");

	const response = await fetch(`http://localhost:3000/users/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();
	if (data.id != undefined) {
		let last_active = data.last_active
			.toString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		let creationDate = data.created_at
			.toString()
			.replace(/T/, " ")
			.replace(/\..+/, "");
		document.querySelector("#character").innerHTML = `
        <h1>${data.name}</h1>
        <div class="normalimgcontainer">
            <a>
                <img class ="normalimg" src=""></img>
            </a>
        </div>
		<h2 class="single">User ID: ${data.id}</h2>
        <h2 class="single">Email: ${data.email}</h2>
		<h2 class="single">Last Active: ${last_active}</h2>
        <h2 class="single">Creation Date: ${creationDate}</h2>
		<h2 class="single">Pity: ${data.pity}</h2>

    `;
		const getCards = await fetch(`http://localhost:3000/cards/${id}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: id }),
		});
		cards = await getCards.json();
		await loadCharacters();
		await initCards();
	} else {
		document.querySelector("#character").innerHTML = `
		<h1>User not found</h1>
	`;
	}
};

let userList = [];
const cardContainer = document.getElementById("cardContainer");

async function initCards() {
	const setCards = async function () {
		if (cards.length > 0) {
			await Promise.all(
				cards.map((card) => {
					let cardObject = card;
					let hpListCharacter = hpList.filter((element) => {
						return element.name == cardObject.name;
					});
					cardObject.actor = hpListCharacter[0].actor;
					cardObject.house = hpListCharacter[0].house;
					cardObject.image = hpListCharacter[0].image;
					cardObject.slug = hpListCharacter[0].slug;
					cardObject.isnew = "no";
					userList.push(cardObject);
				})
			);
		}
	};
	await setCards();
	userList.sort((a, b) => a - b);
	userList.reverse();
	sortUserlist();
	displayChar(userList);
}

let favList = [];
const displayChar = (characters) => {
	let htmlString = "";
	characters.forEach((character, i) => {
		//on exécute le code suivant pour chaque personnage de la liste characters
		//on crée un string qui contient ce qui va être inséré dans l'html
		htmlString = `${htmlString}
        <div id="${character.rarity}" class="card ${character.isnew}">  
        <div class="imgcard">
            <a href="single.html?slug=${character.slug}">
                <img class ="cardimg" src="${character.image}"></img>
            </a>
        </div>
        <div class="textcard">
            <h2>${character.name}</h2>
            <h3>House: ${character.house}</h3>
            <h3>Actor: ${character.actor}</h3>
            <h3>Rarity: ${character.rarity}</h3>
            <div class="cardbuttons">
                <div class="x_container" id="x${i}">
                    <i id="x" class="fa-solid fa-xmark"></i>
                </div>
                <div class="h_container" id="heartc${i}">
                    <i id="heart" class="far fa-heart"></i>
                </div>
            </div>
        </div>
    </div>
                        `;
	}); //le code ci-dessus constitue une carte avec un personnage, son image, son nom, sa maison, son acteur, sa rareté, un bouton pour mettre en favori et un bouton pour supprimer la carte

	cardContainer.innerHTML = htmlString; //on ajoute le string html dans le code html pour afficher les cartes
	for (let i = 0; i < favNumber; i++) {
		//on fait apparaître les favoris sur les cartes en rouge en fonction du nombre de favoris
		document.getElementById(`heartc${i}`).classList.toggle("favorited");
	}
	let i = -1;
	document.querySelectorAll(".card").forEach((element) => {
		//on fait apparaître graduellement les cartes avec un effet de fade
		let speed = (1 / characters.length) * 1000; //plus il y a de cartes, plus elles s'afficheront vite
		i++;
		setTimeout(function fade() {
			//la durée du timeout dépend du nombre total de cartes
			element.classList.add("fade");
		}, speed * i);
	});
};
function sortUserlist() {
	favList = [];
	let nonFavList = [];
	userList.forEach((character) => {
		if (character.delete == "delete") {
			userList.splice(userList.indexOf(character), 1); //supprime la carte si elle a l'attribut delete
		}
	});
	for (let i = 0; i < userList.length; i++) {
		if (userList[i].favorite) {
			favList.push(userList[i]); //ajoute dans la première liste les cartes mises en favori
		} else {
			nonFavList.push(userList[i]); //ajoute dans la deuxième liste les cartes non favorites
		}
	}
	favNumber = favList.length; //calcule le nombre de cartes mises en favori pour l'affichage
	userList = favList.concat(nonFavList); //crée une nouvelle liste à partir de la liste des favoris et des non-favoris pour avoir l'ordre
}
let hpList = [];
let hpCharacters = [];
const loadCharacters = async () => {
	const res = await fetch("https://hp-api.lainocs.fr/characters"); //on va chercher la liste des personnages dans l'API
	hpCharacters = await res.json(); //on la met dans hpCharacters
	hpCharacters.forEach((element) => {
		if (element.image) {
			hpList.push(element); //on ajoute à hpList seulement les personnages qui ont une image
		}
	});
	hpList.forEach((element) => {
		if (element.house == "") {
			element.house = "None"; //on remplace le "" par None pour les personnages qui n'ont pas de maison
		}
	});
};

if (localStorage.getItem("token") === null) {
	window.location.href = "/front/register.html";
} else {
	getProfile();
}
