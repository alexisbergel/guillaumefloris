export default class PostModal {
	constructor() {
		this.modal = document.querySelector('#post-modal');
		this.closeButton = this.modal.querySelector('.modal-close-button');
		this.titleInput = this.modal.querySelector('#post-modal-title');
		this.descriptionInput = this.modal.querySelector('#post-modal-description');
		this.picture = this.modal.querySelector('img');
		this.fileInput = this.modal.querySelector('input[name="file"]');
		this.deleteButton = this.modal.querySelector('#post-modal-delete-button');
		this.postButton = this.modal.querySelector('#post-modal-save-button');
		this.tagButtons = this.modal.querySelector('#post-modal-tags').querySelectorAll('button');
		this.itemId = null;
		this.tag = null;
		this.editMode = false;

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.post = this.post.bind(this);
		this.patch = this.patch.bind(this);
		this.delete = this.delete.bind(this);



		/* Events */

		this.closeButton.addEventListener('click', this.hide);
		this.deleteButton.addEventListener('click', this.delete);

		// Opens System File Manager when user clicks on preview image (empty by default)
		this.picture.addEventListener('click', () => {
			this.fileInput.click();
		});

		// Adds loaded image as preview
		this.fileInput.addEventListener('change', () => {
			if(this.fileInput.files && this.fileInput.files[0]) {
				const reader = new FileReader();
				reader.onload = (result) => {
					this.picture.src = result.target.result;
				}
				reader.readAsDataURL(this.fileInput.files[0]);
			}
		});

		// Adds click event to each tag button (allows user to change the selected tag)
		this.tagButtons.forEach(button => {
			button.addEventListener('click', (event) => {
				const selectedTag = event.currentTarget;
				const selectedTagId = selectedTag.getAttribute('data-tag');
				//const selectedtagId = selectedTag.getAttribute('data-tag');

				// If tag's already selected, unselect
				if (selectedTag.classList.contains('selected-tag')) {
					this.tag = null;
					selectedTag.classList.remove('selected-tag');

				} else {
					this.deselectTags();
					selectedTag.classList.add('selected-tag')
					this.tag = selectedTagId;
				}
			});
		});

		// Submits request
		this.postButton.addEventListener('click', () => {
			if (this.editMode) {
				this.patch();
			} else {
				this.post();
			}
		});
	}

	selectTagForId(id) {
		const selectedTagButton = document.querySelector('#post-modal-tags').querySelector(`[data-tag="${id}"]`);
		if (selectedTagButton) selectedTagButton.classList.add('selected-tag');
	}

	deselectTags() {
		this.tagButtons.forEach(tg => tg.classList.remove('selected-tag'));
	}

	show(item) {
		if (item) {
			// Sets up data if a post is provided for editing
			this.itemId = item.id;
			this.titleInput.value = item.title;
			this.descriptionInput.value = item.description;
			this.picture.src = item.imgSrc;
			this.editMode = true;
			this.tag = item.tagId.length === 0 ? null : item.tagId;
			this.selectTagForId(this.tag);
			this.modal.classList.add('edit-mode');
		}

		// Shows modal
		this.modal.setAttribute('data-active', true);
	}

	hide() {
		// Resets data
		this.titleInput.value = '';
		this.descriptionInput.value = '';
		this.picture.src = '';
		this.fileInput.value = '';
		this.editMode = false;
		this.itemId = null;
		this.tag = null;
		this.modal.classList.remove('edit-mode');
		this.deselectTags();

		// Hides modal
		this.modal.setAttribute('data-active', false);
	}

	post() {
		// Checks if user provides title, description and a file (if not, return)
		const title = this.titleInput.value ?? '';
		const description = this.descriptionInput.value ?? '';
		const file = this.modal.querySelector('input[name="file"]').files[0];
		const tagId = this.tag;
		if (title.trim().length === 0 || description.trim().length === 0 || !file) return;

		// Prepares data for the fetch 
		let formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('file', file);
		formData.append('tagId', tagId);

		fetch('/post/new', {
			method: 'POST',
			body: formData
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			}

			return response.text().then(text => { throw new Error(text)});
		})
		.then(data => {
			// TODO : Ne pas actualiser la page et utiliser PostItem pour le faire dynamiquement
			window.location.reload();
		})
		.catch(error => {
			console.error('PostModal - post() - Error', error);
		});
	}

	patch() {
		// Checks if user provides title, description and a file (if not, return)
		const title = this.titleInput.value ?? '';
		const description = this.descriptionInput.value ?? '';
		const file = this.fileInput.files[0];
		const tagId = this.tag;
		if (title.trim().length === 0 || description.trim().length === 0) { return; }
		
		// Prepares data for the fetch
		let formData = new FormData();
		formData.append('title', title);
		formData.append('description', description);
		formData.append('tagId', tagId);
		if (file) formData.append('file', file);

		fetch(`/post/${this.itemId}`, {
			method: 'PATCH',
			body: formData
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			}

			return response.text().then(text => { throw new Error(text)});
		})
		.then(data => {
			window.location.reload();
		})
		.catch(error => {
			console.error('PostModal - patch() - Error', error);
		});
	}

	delete() {
		// Delete a post is only possible on edit mode
		if (!this.editMode || !this.itemId) return;

		fetch(`/post/${this.itemId}`, {
			method: 'DELETE',
		})
		.then(response => {
			if (response.ok) {
				return response.json();
			}

			return response.text().then(text => { throw new Error(text)});
		})
		.then(data => {
			window.location.reload();
		})
		.catch(error => {
			console.error('PostModal - delete() - Error', error);
		});
	}
}