const form = document.querySelector('form');
const formInputs = form.querySelectorAll('.form-input');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const mail = form.querySelector('input[name="mail"]').value ?? '';
    const message = form.querySelector('textarea').value ?? '';

    const data = {
        mail: mail,
        message: message
    };

    fetch('/contact', {
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
        // .form-executed show a confirmation message and hide the form
        document.querySelector('section').classList.add('form-executed');				
    })
    .catch(error => {
        const errorResponse = JSON.parse(error.message);

        // Resets form messages (in case of several unsuccessful attempts)
        formInputs.forEach(input => {
            input.classList.remove('input-error');
        });

        // .input-error highlights the right input
        // response is an array containing 'mail', 'message' or both
        errorResponse.message.forEach(response => {
            switch(response.field) {
                case 'mail':
                    formInputs[0].classList.add('input-error');
                    break;

                case 'message':
                    formInputs[1].classList.add('input-error');
            }
        });

        console.error('Contact - sendMessage() - Error', error);
    });
});
