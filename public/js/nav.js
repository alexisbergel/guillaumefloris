const mobileNavButton = document.querySelector('.mobile-nav-button');
const mobileNavCloseButton = document.querySelector('.mobile-nav-close-button');
const nav = document.querySelector('nav');


/* Functions */
function showMobileNav() {
    const isVisible = nav.classList.contains('visible-nav');
    nav.classList.toggle('visible-nav', isVisible === false);
} 

function hideMobileNav() {
    nav.classList.remove('visible-nav');
}



/* Events */

mobileNavButton.addEventListener('click', showMobileNav);
mobileNavCloseButton.addEventListener('click', hideMobileNav);