import ProfileModal from "./classes/ProfileModal.js";
import PostModal from "./classes/PostModal.js";

let items = document.querySelectorAll('.item');

const postModal = new PostModal();
const profileModal = new ProfileModal();

const menuButton = document.querySelector('#nav-menu-button');
const menu = document.querySelector('#nav-menu');
const profileButton = menu.querySelector('a');

const addButton = document.querySelector('#add-button');



/* Functions */

function editItem(event) {
	const selectedItem = event.currentTarget;

	// Creates an object that contains item informations for the modal
	const item = {};
	item.id = selectedItem.getAttribute('data-id');
	item.title = selectedItem.getAttribute('data-title');
	item.description = selectedItem.getAttribute('data-description');
	item.tagId = selectedItem.getAttribute('data-tag');
	item.imgSrc = selectedItem.querySelector('img').getAttribute('src');

	// Opens Post Modal in edit mode with item informations
	postModal.show(item);
}



/* Events */

menuButton.addEventListener('click', function(event) {
	const state = (menu.getAttribute('data-active') === "true") ? "false" : "true"; 
	menu.setAttribute('data-active', state);
});

// Shows Profile Modal when user clicks on "Profile" button
profileButton.addEventListener('click', function() {
	profileModal.show();
});

// Closes nav menu when user clicks outside of the menu
// TODO : Remove the event listener when the menu is closed (better performances)
document.addEventListener('click', function(event) {
	if (menu.getAttribute('data-active') === "true" && !event.target.closest('#nav-menu-button')) {
		menu.setAttribute('data-active', 'false');
	}
});

// Shows Post Modal when user clicks on the add button
addButton.addEventListener('click', function() {
	postModal.show();
});

// Adds editItem to each image (editItem opens PostModal with item informations for editing)
items.forEach(item => {
	item.addEventListener('click', editItem);
});