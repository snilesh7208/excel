document.addEventListener('DOMContentLoaded', function () {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            // Gather form data
            // Adjust selectors based on the specific form structure (contact page vs index quote form)
            let formData = {};
            if (form.id === 'contactForm') {
                formData = {
                    name: form.querySelector('input[name="name"]').value,
                    email: form.querySelector('input[name="email"]').value,
                    subject: form.querySelector('input[name="subject"]').value,
                    message: form.querySelector('textarea[name="message"]').value
                };
            } else {
                // Assuming the quote form on index.html
                // Note: The index.html form IDs need to be consistent or we need to map them
                // Based on index.html view:
                // gname -> Name, gmail -> Email, cname -> Mobile (using as subject or part of message), cage -> Service Type, message -> Message
                const name = form.querySelector('#gname') ? form.querySelector('#gname').value : '';
                const email = form.querySelector('#gmail') ? form.querySelector('#gmail').value : '';
                const mobile = form.querySelector('#cname') ? form.querySelector('#cname').value : '';
                const service = form.querySelector('#cage') ? form.querySelector('#cage').value : '';
                const msg = form.querySelector('#message') ? form.querySelector('#message').value : '';

                formData = {
                    name: name,
                    email: email,
                    subject: `Quote Request - ${service}`,
                    message: `Mobile: ${mobile}\nService Type: ${service}\n\n${msg}`
                };
            }

            try {
                const response = await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                // Check if the response is JSON
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    if (response.ok) {
                        alert('Message sent successfully!');
                        form.reset();
                    } else {
                        alert('Failed to send message: ' + (result.message || 'Unknown error'));
                    }
                } else {
                    // If not JSON, it's likely a 404 or 500 HTML page from the server
                    if (response.status === 404) {
                        alert('Error: The email function was not found. \n\nIf you are testing locally, you must use "netlify dev" to run the backend functions. \n\nIf you are on Netlify, check if the function deployed correctly.');
                    } else {
                        const text = await response.text();
                        console.error('Non-JSON response:', text);
                        alert(`An error occurred (Status: ${response.status}). Please check the console for details.`);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please check your internet connection or try again later.');
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    });
});
