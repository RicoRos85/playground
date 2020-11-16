const rememberDiv   = document.querySelector('.remember');
const forgetDiv     = document.querySelector('.forget');
const form          = document.querySelector('form');
const nameInput     = document.querySelector('#writeName');
const submitBtn     = document.querySelector('#submitName');
const forgetBtn     = document.querySelector('#forgetName');
const h1            = document.querySelector('h1');

const personalGreeting = document.querySelector('.personal-greeting');

form.addEventListener('submit', function(e) {
    e.preventDefault();
});

submitBtn.addEventListener('click', function() {
    localStorage.setItem('navn', nameInput.value);
    nameDisplayCheck();
});

forgetBtn.addEventListener('click', function() {
    localStorage.removeItem('navn');
    nameDisplayCheck();
}); 

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

document.body.onload = nameDisplayCheck;