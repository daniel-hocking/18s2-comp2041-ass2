import * as helpers from './helpers.js';
import API from './api.js';

export default class User {
  
  constructor() {
    this.api = new API();
  }
  
  checkToken() {
    this.token = helpers.checkStore('token');
    return this.token
  }
  
  setToken(token) {
    this.token = token;
    helpers.setStore('token', token);
  }
    
  createLoginForm() {
    const login_form = helpers.createElement('div', null, { id: 'login-form', class: 'login-form' });
    login_form.appendChild(helpers.createElement('div', 'Login'));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-username', type: 'text', name: 'username', placeholder: 'Username' }));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-password', type: 'password', name: 'password', placeholder: 'Password' }));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-submit', type: 'button', name: 'submit', value: "Submit", placeholder: 'Submit' }));
    
    helpers.appendNodeTo('main-section', login_form);
    
    this.onSubmitLoginForm();
  }
  
  onSubmitLoginForm() {
    document.getElementById('login-submit').addEventListener('click', ()=> {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      this.api.checkLogin(username, password)
        .then(login => {
          if(login.status !== 200)
            return false;
            
          login.json()
            .then(login_token => {
              console.log(login_token);
              this.setToken(login_token.token);
              helpers.removeFrom('main-section', 'login-form');

              this.displayFeed();
          });
      })
    });
  }
  
  displayFeed() {
    const html_tag = document.getElementById('html-tag');
    html_tag.classList.add('auth');
    html_tag.classList.remove('not-auth');
    
    const input = document.querySelector('input[type="file"]');
    input.addEventListener('change', helpers.uploadImage);
    
    const feed = this.api.getFeed();

    feed
    .then(posts => {
        console.log(posts);
        if(posts.length) {
          posts.reduce((parent, post) => {

              parent.appendChild(helpers.createPostTile(post));
              
              return parent;

          }, document.getElementById('large-feed'))
        } else {
          document.getElementById('large-feed').appendChild(helpers.createPostTile(posts));
        }
    });
  }

}