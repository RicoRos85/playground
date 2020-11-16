/*
 * EXAMPLE - localStotage
 *
 * A very simple example of how to use the
 * localStorage functionality in javascript
 * to save a name on submit.
*/


// Save all elements on index.html i variables
const rememberDiv   = document.querySelector('.remember');
const forgetDiv     = document.querySelector('.forget');
const form          = document.querySelector('form');
const nameInput     = document.querySelector('#writeName');
const submitBtn     = document.querySelector('#submitName');
const forgetBtn     = document.querySelector('#forgetName');
const h1            = document.querySelector('h1');

const personalGreeting = document.querySelector('.personal-greeting');

// Prevent form from firing on default
form.addEventListener('submit', function(e) {
    e.preventDefault();
});

// Add eventListener to if Submit Button is clicked and run function
submitBtn.addEventListener('click', function() {
    localStorage.setItem('navn', nameInput.value);
    nameDisplayCheck();
});

// Add eventListener to if Forget Button is clicked and run function
forgetBtn.addEventListener('click', function() {
    localStorage.removeItem('navn');
    nameDisplayCheck();
}); 

// Function to display name and hide/show elements
function nameDisplayCheck() {
    if(localStorage.getItem('navn')) {
        let name = localStorage.getItem('navn');
        h1.textContent = 'Velkommen ' + name;
        personalGreeting.textContent = 'Velkommen til vores hjemmeside ' + name + '. Dit navn er nu gemt i localStorage.';
        forgetBtn.classList.remove("hide-class");
        forgetDiv.classList.remove("hide-class");
        rememberDiv.classList.add("hide-class");
        submitBtn.classList.add("hide-class");   
    } else {
        h1.textContent = 'Velkommen ukendte person';
        personalGreeting.textContent = 'Velkommen til vores hjemmeside fremmede. Indtast dit navn for at gemme det i localStorage.';
        forgetBtn.classList.add("hide-class");
        forgetDiv.classList.add("hide-class");
        rememberDiv.classList.remove("hide-class");
        submitBtn.classList.remove ("hide-class");
    }
}

// Run nameDisplayCheck() on page load
document.body.onload = nameDisplayCheck;