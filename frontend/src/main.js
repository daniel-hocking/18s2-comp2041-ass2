// importing named exports we use brackets
import { createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';


(function() {
    const api  = new API();

    document.getElementById('login_submit').addEventListener('click', ()=> {
        const username = document.getElementById('login_username').value;
        const password = document.getElementById('login_password').value;

        api.checkLogin(username, password)
          .then(login => {
            if(login !== 200)
                return false;
            const html_tag = document.getElementById('html-tag');
            html_tag.classList.add('auth');
            html_tag.classList.remove('not-auth');

            displayFeed(api);
            setupUpload();
        });
    });

}());


export function displayFeed(api) {
    // we can use this single api request multiple times
    const feed = api.getFeed();

    feed
    .then(posts => {
        console.log(posts);
        if(posts.length) {
          posts.reduce((parent, post) => {

              parent.appendChild(createPostTile(post));
              
              return parent;

          }, document.getElementById('large-feed'))
        } else {
          document.getElementById('large-feed').appendChild(createPostTile(posts));
        }
    });
}

export function setupUpload() {
    // Potential example to upload an image
    const input = document.querySelector('input[type="file"]');

    input.addEventListener('change', uploadImage);
}

