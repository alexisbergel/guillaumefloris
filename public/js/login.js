const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
        


/* Functions */

function signup(event) {
    event.preventDefault();

    // Gets username, password and confirmation from the form
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const confirmedPassword = document.querySelector('input[name="confirmation-password"]').value;

    // Prepares data for the fetch
    const data = {
        username: username,
        password: password,
        confirmedPassword: confirmedPassword
    };

    fetch('/signup', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }

        return response.text().then(text => { throw new Error(text)});
    })
    .then(data => {
        // If success, redirect user to the dashboard
        if (data.redirect) {
            window.location.href = data.redirect;
        }
    })
    .catch(error => {
        let errorResponse = JSON.parse(error.message);
        errorResponse = errorResponse.message ?? '';

        event.target.querySelector('.form-feedback').textContent = errorResponse;
        event.target.classList.add('input-error');
    });
}


function login(event) {
    event.preventDefault();

    // Removes input-error class if this is not the first try
    event.target.classList.remove('input-error');

    // Gets username, password and confirmation from the form
    const username = document.querySelector('input[name="username"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Prepares data for the fetch
    const data = {
        username: username,
        password: password
    };

    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }

        return response.text().then(text => { throw new Error(text)});
    })
    .then(data => {
        // If success, redirect user to the dashboard
        if (data.redirect) {
            window.location.href = data.redirect;
        }
    })
    .catch(error => {
        let errorResponse = JSON.parse(error.message);
        errorResponse = errorResponse.message ?? '';
        event.target.querySelector('.form-feedback').textContent = errorResponse;
        event.target.classList.add('input-error');
    });
}



/* Events */

if (signupForm) {
    signupForm.addEventListener('submit', signup);
}

if (loginForm) {
    loginForm.addEventListener('submit', login);
}
