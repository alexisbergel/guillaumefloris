export default class PostItem {
	constructor(title, description, filename) {
		//! NOT USED FOR NOW
		// TODO: Rewrite with id (and filename seems to be the full resolution image)


		// Crée une div avec la class 'item'
		const div = document.createElement('div');
		div.classList.add('item');
		div.setAttribute('data-title', title);
		div.setAttribute('data-description', description);
		//div.setAttribute('data-id', )
		div.addEventListener('click', editItem);
		
		// Crée un élément img et l'ajoute à la div précédemment créée
		const img = document.createElement('img');
		img.src = `images/${filename}`;
		div.appendChild(img);
	
		return div;
	}
}