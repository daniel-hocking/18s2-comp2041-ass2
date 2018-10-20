import * as helpers from './helpers.js';
import API from './api.js';

export default class Post {
  
  constructor(user) {
    this.api = new API();
    this.token = user.token;
    this.user = user;
  }
  
  displayFeed() {
    const html_tag = document.getElementById('html-tag');
    html_tag.classList.add('auth');
    html_tag.classList.remove('not-auth');
    
    document.querySelector('input[type="file"]').addEventListener('change', helpers.uploadImage);
    document.getElementById('logout-btn').addEventListener('click', this.user.logoutCurrentUser);
    
    const feed = this.api.getFeed(this.token);

    feed
    .then(posts => {
        console.log(posts);
        if(posts) {
          posts['posts'].reduce((parent, post) => {

              parent.appendChild(helpers.createPostTile(post));
              
              return parent;

          }, document.getElementById('large-feed'))
        } else {
          document.getElementById('large-feed').appendChild(helpers.createPostTile(posts));
        }
    });
  }
  
}