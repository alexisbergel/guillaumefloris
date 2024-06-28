// Lazy Loading

const lazyItems = document.querySelectorAll('.lazy');
const observer = new IntersectionObserver(showArticle, { rootMargin: "0px" });
const loadingObserver = new IntersectionObserver(loadArticle, { rootMargin: "200px"});

function showArticle(entries, observer) {
    entries.forEach(entry => {

        if (entry.isIntersecting) {
            entry.target.classList.remove('hidden');
            observer.unobserve(entry.target);
        }
    });
}

function loadArticle(entries, observer) {
    entries.forEach(entry => {

        if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');

            if (img) {
                // Get img url from data-src attribute
                const imgSrc = img.getAttribute('data-src');
                const imgSrcSet = img.getAttribute('data-srcset');

                if (imgSrc) {
                    // Set img url to load the image
                    img.src = imgSrc;
                    img.removeAttribute('data-src');
                }

                if (imgSrcSet) {
                    img.srcset = imgSrcSet;
                    img.removeAttribute('data-srcset');
                }
            }

            console.log(img.currentSrc);
            
            observer.unobserve(entry.target);
        }
    });
}

lazyItems.forEach(lazyItem => {
    observer.observe(lazyItem);
    loadingObserver.observe(lazyItem);
});



// Tags

const items = document.querySelectorAll('article:not(:first-child)');
const tagButtons = document.querySelectorAll('.tag-button');
let filteredItems = [];

function filterItemsByTag(tagName) {
    
    // Reset filteredItems
    filteredItems = [];

    items.forEach(item => {
        const itemTagName = tagName === 'all' ? 'all' : item.getAttribute('data-tag');

        if (itemTagName === tagName) {
            item.classList.remove('filtered-article');
            filteredItems.push(item);

        } else {
            item.classList.add('filtered-article');
        }
    });

    // Update the layout (reverse and overlapping)
    updateFilteredLayout();

    // Adding the .filtered-content class displays the new layout after it is rebuilt in updateFilteredLayout()
    const content = document.querySelector('content');

    if (content) {
        content.classList.toggle('filtered-content', tagName !== 'all');

        // visible-footer adjusts footer position if there is no post to be visible without scrolling
        content.classList.toggle('visible-footer', filteredItems.length === 0);
    }
}

function updateFilteredLayout() {

    filteredItems.forEach((filteredItem, index) => {
        
        // Update reverse property 
        const reverseClass = index % 2 === 0 ? 'filtered-even' : 'filtered-odd';
        filteredItem.classList.remove('filtered-even', 'filtered-odd');
        filteredItem.classList.add(reverseClass);

        // Update overlapping property
        const isPortrait = filteredItem.classList.contains('portrait');

        if (isPortrait) {

            // If current item is portrait, update overlap property according to previous item orientation
            // or index if it's the first item
            const isOverlapping = index === 0 || filteredItems[index - 1].classList.contains('portrait');
            filteredItem.classList.toggle('overlap', isOverlapping);
        }
    });
}

// Event listener on tag buttons
tagButtons.forEach(tag => {
    tag.addEventListener('click', function() {
        // If tag's already selected
        if (tag.classList.contains('selected')) {
            // Unselect button
            tag.classList.remove('selected');
            filterItemsByTag('all');
            
        } else {
            // Unselect all
            tagButtons.forEach(tg => tg.classList.remove('selected'));

            // Select new button 
            tag.classList.add('selected');

            const selectedTagName = tag.getAttribute('data-tag');
            filterItemsByTag(selectedTagName);
        }
    });
});