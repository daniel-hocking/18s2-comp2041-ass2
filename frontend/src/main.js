// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';


(function() {
    const api  = new API();

    document.getElementById('login_submit').addEventListener('click', ()=> {
        const username = document.getElementById('login_username').value;
        const password = document.getElementById('login_password').value;

        const users = api.getUser();
        users.then(user => {
            const valid_user = user.find(u => u.username === username);
            if(!valid_user)
                return false;
            const html_tag = document.getElementById('html-tag');
            html_tag.classList.add('auth');
            html_tag.classList.remove('not-auth');

            displayFeed(api);
        });
    });

}());


export function displayFeed(api) {
    // we can use this single api request multiple times
    const feed = api.getFeed();

    feed
    .then(posts => {
        posts.reduce((parent, post) => {

            console.log(post);
            parent.appendChild(createPostTile(post));
            
            return parent;

        }, document.getElementById('large-feed'))
    });
}

export function setupUpload() {
    // Potential example to upload an image
    const input = document.querySelector('input[type="file"]');

    input.addEventListener('change', uploadImage);
}

