"use strict";
let boosterCd = true;
document.querySelector("#boostercontainer").classList.add("deadgebutton");
document.querySelector("#booster").classList.add("deadgebutton");
import delay from "../node_modules/delay/index.js";
const setAsyncTimeout = (cb, timeout = 0) =>
	new Promise((resolve) => {
		setTimeout(() => {
			cb();
			resolve();
		}, timeout);
	});
let data;
let id;
let cards;
let setIntervalAsync = SetIntervalAsync.setIntervalAsync;
let pity;
let cardsPerBooster = 5;
let boosterDuration = cardsPerBooster * 3000 + 1000;
let userList = [];
let filteredCharacters = [];
let filteredSortedList = [];
let searchString = "";
let currentFilter = "none";
let currentRarity = "none";

window.getProfile = async function getProfile() {
	userList = [];
	const token = localStorage.getItem("token");

	const response = await fetch("http://localhost:3000/getMyProfile", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	data = await response.json();
	id = await data.id;
	pity = await data.pity;
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
	let current = new Date();
	current = current.toISOString();
	const start = new Date(data.last_booster).getTime();
	const end = new Date(current).getTime();
	const milliseconds = Math.abs(end - start).toString();
	const seconds = parseInt(milliseconds / 1000);
	const minutes = parseInt(seconds / 60);
	const hours = parseInt(minutes / 60);
	const days = parseInt(hours / 24);
	if (seconds >= 20) {
		boosterCd = false;
		document
			.querySelector("#boostercontainer")
			.classList.remove("deadgebutton");
		document.querySelector("#booster").classList.remove("deadgebutton");

		document.querySelector("#cooldownText").innerHTML = `Ready !`;
	} else {
		boosterCd = true;
		document.querySelector("#booster").classList.add("deadgebutton");

		document.querySelector("#boostercontainer").classList.add("deadgebutton");
		let cdtext = "Cooldown : ";
		//if (hours < 0) {
		let actualhours = hours - days * 24;
		cdtext += `${23 - actualhours}h `;

		//}
		//if (minutes > 0 || hours > 0) {
		let actualminutes = minutes - hours * 60;
		cdtext += `${59 - actualminutes}m `;
		//}
		let actualseconds = seconds - minutes * 60;
		cdtext += `${59 - actualseconds}s`;

		document.querySelector("#cooldownText").innerHTML = cdtext;
	}
	checkBoosterCd();
};

async function checkBoosterCd() {
	setIntervalAsync(async () => {
		let current = new Date();
		current = current.toISOString();
		const start = new Date(data.last_booster).getTime();
		const end = new Date(current).getTime();
		const milliseconds = Math.abs(end - start).toString();
		const seconds = parseInt(milliseconds / 1000);
		const minutes = parseInt(seconds / 60);
		const hours = parseInt(minutes / 60);
		const days = parseInt(hours / 24);
		if (seconds >= 20) {
			boosterCd = false;
			document
				.querySelector("#boostercontainer")
				.classList.remove("deadgebutton");
			document.querySelector("#booster").classList.remove("deadgebutton");

			document.querySelector("#cooldownText").innerHTML = `Ready !`;
		} else {
			boosterCd = true;
			document.querySelector("#booster").classList.add("deadgebutton");

			document.querySelector("#boostercontainer").classList.add("deadgebutton");
			let cdtext = "Cooldown : ";
			//if (hours < 0) {
			let actualhours = hours - days * 24;
			cdtext += `${23 - actualhours}h `;

			//}
			//if (minutes > 0 || hours > 0) {
			let actualminutes = minutes - hours * 60;
			cdtext += `${59 - actualminutes}m `;
			//}
			let actualseconds = seconds - minutes * 60;
			cdtext += `${59 - actualseconds}s`;

			document.querySelector("#cooldownText").innerHTML = cdtext;
		}
	}, 1000);
}

if (localStorage.getItem("token") === null) {
	window.location.href = "/front/register.html";
} else {
	getProfile();
}
const cardContainer = document.getElementById("cardContainer");

//fonctionnement de la barre de recherche dynamique
let searchBar = document.getElementById("search");
searchBar.addEventListener("input", (e) => {
	searchString = e.target.value.toLowerCase();
	//searchstring contient l'input de l'utilisateur
	filteredCharacters = userList.filter((character) => {
		//filteredcharacters est la nouvelle liste de personnages filtrée
		if (character.house == currentFilter || currentFilter == "none") {
			return (
				character.name.toLowerCase().includes(searchString) ||
				(character.house.toLowerCase().includes(searchString) &&
					character.house.toLowerCase().includes(currentFilter))
				//on renvoie seulement dans la liste filtrée les personnages dont le nom ou la maison contient l'input de l'utilisateur + le filtre de maison
			);
		}
	});
	if (filteredCharacters.length > 0) {
		sortList(filteredCharacters);
	} else {
		cardContainer.innerHTML = `
        <h2>No cards</h2>
        `;
	}
});

//la fonction suivante filtre la liste de personnage en fonction de la barre de recherche et du filtre de maison
function sortChars(list) {
	if (searchString !== "" && currentFilter == "none") {
	} else {
		filteredCharacters = list.filter((character) => {
			if (character.house == currentFilter || currentFilter == "none") {
				return (
					character.name.toLowerCase().includes(searchString) ||
					(character.house.toLowerCase().includes(searchString) &&
						character.house.toLowerCase().includes(currentFilter))
				);
			}
		});
		if (filteredCharacters.length > 0) {
			sortList(filteredCharacters);
		} //s'il n'y a pas de carte à afficher, affiche le texte suivant
		else {
			cardContainer.innerHTML = `
            <h2>No cards</h2>
            `;
		}
	}
}

let modal = document.getElementById("modal");
//on récupère le bouton pour faire apparaître le modal

//le modal disparaît si on clique sur la croix
document.querySelector("span").addEventListener("click", async function () {
	await getProfile();
	sortChars(userList);
});

//le modal disparaît si on clique en dehors
window.onclick = async function (event) {
	if (event.target == modal) {
		await getProfile();
		modal.style.display = "none";
	}
};

let favSort = [];
let favNumber;
async function deleteCardFromDb(character) {
	const id = character.id;
	await fetch(`http://localhost:3000/cards/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
}
//cette fonction organise la liste de personnage en fonction des cartes mises en favori et supprime les cartes mises en "delete"
function sortList(list) {
	favSort = [];
	let nonFavSort = [];
	list.forEach((character) => {
		if (character.delete == "delete") {
			deleteCardFromDb(character);
			list.splice(list.indexOf(character), 1); //supprime la carte si elle a l'attribut delete
		}
	});
	for (let i = 0; i < list.length; i++) {
		if (list[i].favorite) {
			favSort.push(list[i]); //ajoute dans la première liste les cartes mises en favori
		} else {
			nonFavSort.push(list[i]); //ajoute dans la deuxième liste les cartes non favorites
		}
	}
	favNumber = favSort.length; //calcule le nombre de cartes mises en favori pour l'affichage
	filteredSortedList = favSort.concat(nonFavSort); //crée une nouvelle liste à partir de la liste des favoris et des non-favoris pour avoir l'ordre
	setFavs(favSort);
	setUnfavs(nonFavSort);
	displayChar(filteredSortedList);
}

async function setFavs(favorites) {
	for (const fav of favorites) {
		const id = fav.id;
		const res = await fetch(`http://localhost:3000/cards/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				favorite: true,
			}),
		});
	}
}

async function setUnfavs(favorites) {
	for (const fav of favorites) {
		const id = fav.id;
		const res = await fetch(`http://localhost:3000/cards/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				favorite: false,
			}),
		});
	}
}

let hpCharacters = [];
let hpList = [];
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
	sortChars(userList);
};

let boosting = false;
let tempChar;
let tempChar2;
let boosterb = document.getElementById("booster");
let cdBar = document.getElementById("cdbar");

async function addBoosterToDB(card) {
	const res = await fetch(`http://localhost:3000/cards/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: card[0].name,
			rarity: card[0].rarity,
			ownerId: id,
			favorite: false,
		}),
	});
	const data = await res.json();
	const result = await fetch(`http://localhost:3000/users/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			pity: pity,
		}),
	});
	let newid = data.id;
	return newid;
}

//la fonction suivante sert à l'ouverture des boosters
boosterb.addEventListener("click", async function () {
	if (!(currentFilter == "none")) {
		//désactivation de tous les filtres
		changeTheme(currentFilter);
		currentFilter = "none";
	}
	if (!(currentRarity == "none")) {
		//désactivation de tous les filtres
		raritySort(currentRarity);
		currentRarity = "none";
	}
	if (!boosterCd) {
		//check si le cooldown est prêt pour le bouton
		boosting = true;
		let currentBooster = new Date();
		currentBooster = currentBooster.toISOString();
		const last_booster = await fetch(`http://localhost:3000/users/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ last_booster: currentBooster }),
		});
		data.last_booster = currentBooster;
		boosterCd = true;
		document.querySelectorAll("button").forEach((element) => {
			element.classList.add("deadgebutton"); //rend inutilisable tous les boutons pour la durée du pack opening
		});
		document.querySelector("#boostercontainer").classList.add("deadgebutton");
		//supprimer et re-ajouter une class à la barre cooldown permet de réinitialiser son animation
		cdBar.classList.remove("round-time-bar");
		cdBar.offsetWidth;
		cdBar.classList.add("round-time-bar");
		cdBar.style = `--duration: ${boosterDuration / 1000};`; //on lui donne une duration de 10 secondes
		searchBar.disabled = true; //on rend inutilisable la barre de recherche
		setTimeout(() => {
			//ce set timeout va réinitialiser le cooldown et va rendre les boutons et la barre de recherche utilisables après 10 secondes
			boosterCd = false;
			searchBar.disabled = false;
			document.querySelectorAll("button").forEach((element) => {
				element.classList.remove("deadgebutton");
			});
			document.querySelector("#booster").classList.add("deadgebutton");
		}, boosterDuration);
		userList.forEach((element) => {
			element.isnew = "no"; //ajoute l'attribut isnew=no à toutes les anciennes cartes(nécessaire pour attribuer les animations)
		});
		const BoostOpen = async () => {
			let sleeptime = 0;
			for (let i = 0; i < cardsPerBooster; i++) {
				await setAsyncTimeout(async () => {
					sleeptime = 3000;
					// on met un délai de 3 secondes à chaque animation et création de carte
					pity += 1; //on ajoute 1 à la "pity", une garantie d'obtenir une carte mythique après un certain nombre de tirages
					localStorage.setItem("pity", pity); //on ajoute la pity au localstorage pour la sauvegarder
					tempChar = [hpList[Math.floor(Math.random() * hpList.length)]]; //choix d'un personnage au hasard dans la liste
					tempChar[0].isnew = "cardbooster"; //on lui donne un attribut pour qu'il ait l'animation booster
					tempChar[0].rarity = "common"; //par défaut on lui donne la rareté common
					tempChar[0].favorite = false; //par défaut il n'est pas en favori
					let randomnum = Math.random(); //on choisit un nombre au hasard
					//en fonction du nombre on donne une rareté différente à la carte
					if (randomnum > 0.75) {
						tempChar[0].rarity = "rare";
					}
					if (randomnum > 0.9) {
						tempChar[0].rarity = "legendary";
					}
					if (randomnum > 0.975) {
						tempChar[0].rarity = "mythical";
						pity = 0;
					}
					//si on atteint plus que 25 pity la carte est garantie d'être mythique
					if (pity > 25) {
						tempChar[0].rarity = "mythical";
						pity = 0;
					}
					//on stringify et parse le tempChar pour le formatter correctement
					tempChar2 = JSON.parse(JSON.stringify(tempChar));
					const id = await addBoosterToDB(tempChar2);
					tempChar2[0].id = id;
					//on ajoute la nouvelle carte à la liste de cartes de l'utilisateur
					userList = tempChar2.concat(userList);
					//on réorganise la liste
					sortChars(userList);
					//on remplace l'attribut cardbooster par no pour ne pas recommencer l'animation de la carte
					userList.forEach((element) => {
						element.isnew = "no";
					});
				}, sleeptime);
			}
		};
		BoostOpen();
	}
	searchBar.value = ""; //on retire l'input de la barre de recherche
	searchString = "";
	setTimeout(() => {
		//après 9050 millisecondes on remplace les attributs cardboosters par no à la fin de l'animation et on réorganise à nouveau les cartes pour mettre à jour la liste et les animations
		userList.forEach((element) => {
			element.isnew = "no";
		});
		sortChars(userList);
		boosting = false;
	}, boosterDuration - 950);
});

//displayChar crée les cartes de chaque personnage
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
	document.querySelectorAll("div.h_container").forEach((x) => {
		//on ajoute un click event aux boutons favori
		x.addEventListener("click", function () {
			heart(this);
		});
	});
	document.querySelectorAll("div.x_container").forEach((x) => {
		//on ajoute un click event aux boutons supprimer
		x.addEventListener("click", function () {
			ciao(this);
		});
	});
	for (let i = 0; i < favNumber; i++) {
		//on fait apparaître les favoris sur les cartes en rouge en fonction du nombre de favoris
		document.getElementById(`heartc${i}`).classList.toggle("favorited");
	}
	localStorage.setItem("cards", JSON.stringify(userList)); //on stocke les cartes dans le localstorage
	if (!boosting) {
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
	} else {
		document.querySelectorAll(".card").forEach((element) => {
			//si l'animation du booster est lancée, on ne met pas d'animation de fade aux cartes
			element.classList.add("appear");
		});
	}

	userList.forEach((element) => {
		//on enlève l'attribut cardbooster aux cartes qui pourraient l'avoir pour ne pas avoir d'animation booster non voulue
		element.isnew = "no";
	});
};

//fonction qui supprime toutes les cartes et les favoris de la liste
function clearUserlist() {
	userList = [];
	favNumber = 0;
	sortChars(userList);
}

//fonction qui donne les bonnes classes aux cartes pour qu'elles aient la bonne couleur en fonction de la rareté

//fonction qui va donner un attribut delete si on appuie sur le bouton supprimer d'une carte
function ciao(element) {
	let xid = element.id;
	let num = xid.split("x").pop();
	num = parseInt(num);
	filteredSortedList[num].delete = "delete";
	sortList(filteredSortedList);
	sortUserlist();
}

//fonction qui va donner un attribut favori si on appuie sur le bouton coeur d'une carte
function heart(element) {
	let hid = element.id;
	let num = hid.split("c").pop();
	num = parseInt(num);
	if (filteredSortedList[num].favorite == false) {
		filteredSortedList[num].favorite = true;
	} else {
		filteredSortedList[num].favorite = false;
	}
	sortList(filteredSortedList);
}
let favList = [];

//cette fonction organise la liste de personnage en fonction des cartes mises en favori et supprime les cartes mises en "delete"
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

//cette fonction change le thème du site et le filtre de maison des cartes
function changeTheme(name) {
	if (!(currentRarity == "none")) {
		//on retire le filtre de rareté pour ne pas causer de soucis
		raritySort(currentRarity);
		currentRarity = "none";
	}
	document.querySelectorAll('[name="sortbutton"]').forEach((e) => {
		//on retire le précédent visuel de filtre sur le bouton
		if (currentFilter == e.id && name !== e.id) {
			e.classList.toggle(currentFilter);
		}
	});
	document.getElementById("nav").classList.toggle(currentFilter); //on retire le précédent visuel sur les éléments du site
	document.getElementById("main").classList.toggle(currentFilter);
	document.getElementById("body").classList.toggle(currentFilter);
	document.getElementById(name).classList.toggle(name);
	if (currentFilter == name) {
		currentFilter = "none"; //désactive le filtre si le bouton a été appuyé deux fois de suite
	} else {
		currentFilter = name; //change la variable au nouveau filtre
		document.getElementById("nav").classList.toggle(currentFilter); //active le visuel du site du nouveau filtre
		document.getElementById("main").classList.toggle(currentFilter);
		document.getElementById("body").classList.toggle(currentFilter);
	}
	sortChars(userList); //actualise la liste des personnages
}

//ajoute les fonctions qui s'exécutent lorsqu'on appuie sur les boutons filtres
document.querySelectorAll('[name="sortbutton"]').forEach((element) => {
	element.addEventListener("click", function () {
		if (!boosting) {
			//les boutons sont inaccessibles s'il y a le cooldown de l'animation
			if (!element.id.includes("Sort")) {
				//on différencie les boutons de filtre de maison et de rareté
				changeTheme(element.id);
			} else {
				raritySort(element.id);
			}
		}
	});
});

//cette fonction change le filtre de rareté des cartes
function raritySort(rarity) {
	document.querySelectorAll('[name="sortbutton"]').forEach((e) => {
		//on retire le précédent visuel de filtre sur le bouton
		if (currentRarity == e.id && rarity !== e.id) {
			e.classList.toggle(currentRarity);
		}
	});
	document.getElementById(rarity).classList.toggle(rarity); //on active le nouveau visuel filtre sur le bouton
	if (currentRarity == rarity) {
		currentRarity = "none"; //désactive le filtre si le bouton a été appuyé deux fois de suite
	} else {
		currentRarity = rarity; //change la variable au nouveau filtre
	}
	let rarityS = rarity.replace("Sort", "").toLowerCase(); //on retire le Sort du nom pour qu'il match avec la rareté sur les cartes
	if (!(currentRarity == "none")) {
		//on crée une nouvelle liste filtrée avec uniquement les cartes de la rareté demandée
		let rarityFiltered = userList.filter((character) => {
			return character.rarity.toLowerCase().includes(rarityS);
		});
		sortChars(rarityFiltered); //on réorganise les cartes
	} else {
		sortChars(userList); //on display la liste normalement s'il n'y a pas de filtre
	}
}

/*
//on récupère les cartes existant dans le localstorage et on les affiche si elles existent
if (typeof localStorage["cards"] !== "undefined") {
	userList = JSON.parse(localStorage.getItem("cards"));
	sortChars(userList);
	displayRare();
	sortUserlist();
}
*/

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
	sortChars(userList);
	sortUserlist();
}
//on initialise à 0 la pity garantie

//on récupère la pity existante si elle existe
/*
if (typeof localStorage["pity"] !== "undefined") {
	pity = JSON.parse(localStorage.getItem("pity"));
}
*/
