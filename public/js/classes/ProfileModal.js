export default class ProfileModal {
	constructor() {
		this.modal = document.querySelector('#profile-modal');
		this.closeButton = this.modal.querySelector('.modal-close-button');
		this.form = this.modal.querySelector('form');
		this.profilePicture = this.modal.querySelector('#profile-modal-photo-picture')
		this.coverPicture = this.modal.querySelector('#profile-modal-cover-picture');
		this.profileFileInput = this.modal.querySelector('input[name="file"]');
		this.coverFileInput = this.modal.querySelector('input[name="file2"]');
		this.coverPictureButton = this.modal.querySelector('.profile-modal-cover-overlay-button');
		this.profilePictureButton = this.modal.querySelector('.profile-modal-photo-overlay-button');
		this.defaultData = {};

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.save = this.save.bind(this);



		/* Functions */

		// Adds loaded cover image as preview
		function addImagePreview(fileInput, imageElement) {
			fileInput.addEventListener('change', () => {
				if (fileInput.files && fileInput.files[0]) {
					const reader = new FileReader();
					reader.onload = (result) => {
						imageElement.src = result.target.result;
					}
					reader.readAsDataURL(fileInput.files[0]);
				}
			});
		}



		/* Events */

		this.closeButton.addEventListener('click', this.hide);
		this.form.addEventListener('submit', this.save);
		
        // Opens System File Manager when user clicks on cover image
		this.coverPictureButton.addEventListener('click', (event) => {
			this.coverFileInput.click();
		});

        // Opens System File Manager when user clicks on profile image
		this.profilePictureButton.addEventListener('click', (event) => {
			this.profileFileInput.click();
		});

		// Adds loaded cover image as preview
		addImagePreview(this.coverFileInput, this.coverPicture);
		addImagePreview(this.profileFileInput, this.profilePicture);
	}



	/* Methods */
	
	show() {
        // Creates an object that saves default data if the user cancels editing 
        this.defaultData.cover = this.coverPicture.getAttribute('src');
        this.defaultData.profilePicture = this.profilePicture.getAttribute('src');
        this.defaultData.fullname = this.modal.querySelector('input[name="fullname"]').value;
        this.defaultData.description = this.modal.querySelector('textarea[name="description"]').value;

        // data-active attribute changes modal visibility in CSS
		this.modal.setAttribute('data-active', 'true');
	}

	hide() {
		this.modal.setAttribute('data-active', 'false');

        // Resets to default data
        this.coverPicture.src = this.defaultData.cover;
        this.profilePicture.src = this.defaultData.profilePicture;
        this.modal.querySelector('input[name="fullname"]').value = this.defaultData.fullname;
        this.modal.querySelector('textarea[name="description"]').value = this.defaultData.description;
		this.coverFileInput.value = '';
		this.profileFileInput.value = '';
        this.defaultData = {};
	}

	save(event) {
		event.preventDefault();

		// Gets data from the form (event.target = form)
		const formData = new FormData(event.target);

		fetch('/profile', {
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
			window.location.reload();
		})
		.catch(error => {
			console.error('ProfileModal - save() - Error: ' + error);
		});
	}
}