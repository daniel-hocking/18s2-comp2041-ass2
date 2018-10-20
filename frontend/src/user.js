import * as helpers from './helpers.js';
import API from './api.js';
import Post from './post.js';

export default class User {
  
  constructor() {
    this.api = new API();
    this.token = this.checkToken();
    if(this.token) {
      this.post = new Post(this);
    } else {
      this.post = null
    }
  }
  
  checkToken() {
    return helpers.checkStore('token');
  }
  
  setToken(token) {
    this.token = token;
    helpers.setStore('token', token);
  }
  
  logoutCurrentUser() {
    helpers.clearStore('token');
    location.reload();
  }
  
  loginUser(token, form_id) {
    console.log(token);
    this.setToken(token.token);
    helpers.removeFrom('main-section', form_id);
    
    this.post = new Post(this);
    this.post.displayFeed();
  }
    
  createLoginForm() {
    helpers.removeFrom('main-section', 'register-form');
    const login_form = helpers.createElement('div', null, { id: 'login-form', class: 'login-form' });
    login_form.appendChild(helpers.createElement('div', 'Login'));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-username', type: 'text', name: 'username', placeholder: 'Username' }));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-password', type: 'password', name: 'password', placeholder: 'Password' }));
    login_form.appendChild(helpers.createElement('input', null, { id: 'login-submit', type: 'button', name: 'submit', value: "Submit", placeholder: 'Submit' }));
    login_form.appendChild(helpers.createElement('br'));
    const register_link = helpers.createElement('a', 'Click here to register', { id: 'register-link', class: 'small', href: '#' });
    register_link.addEventListener('click', this.createRegisterForm.bind(this));
    login_form.appendChild(register_link);
    
    helpers.appendNodeTo('main-section', login_form);
    
    this.onSubmitLoginForm();
  }
  
  createRegisterForm() {
    helpers.removeFrom('main-section', 'login-form');
    const register_form = helpers.createElement('div', null, { id: 'register-form', class: 'register-form' });
    register_form.appendChild(helpers.createElement('div', 'Register'));
    register_form.appendChild(helpers.createElement('input', null, { id: 'register-username', type: 'text', name: 'username', placeholder: 'Username' }));
    register_form.appendChild(helpers.createElement('input', null, { id: 'register-password', type: 'password', name: 'password', placeholder: 'Password' }));
    register_form.appendChild(helpers.createElement('input', null, { id: 'register-email', type: 'email', name: 'email', placeholder: 'Email' }));
    register_form.appendChild(helpers.createElement('input', null, { id: 'register-name', type: 'text', name: 'name', placeholder: 'Name' }));
    register_form.appendChild(helpers.createElement('input', null, { id: 'register-submit', type: 'button', name: 'submit', value: "Submit", placeholder: 'Submit' }));
    register_form.appendChild(helpers.createElement('br'));
    const login_link = helpers.createElement('a', 'Click here to login', { id: 'login-link', class: 'small', href: '#' });
    login_link.addEventListener('click', this.createLoginForm.bind(this));
    register_form.appendChild(login_link);
    
    helpers.appendNodeTo('main-section', register_form);
    
    this.onSubmitRegisterForm();
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
              this.loginUser(login_token, 'login-form');
          });
      })
    });
  }
  
  onSubmitRegisterForm() {
    document.getElementById('register-submit').addEventListener('click', ()=> {
      const register_username = document.getElementById('register-username').value;
      const register_password = document.getElementById('register-password').value;
      const register_email = document.getElementById('register-email').value;
      const register_name = document.getElementById('register-name').value;

      this.api.reigtserUser(register_username, register_password, register_email, register_name)
        .then(register => {
          if(register.status !== 200)
            return false;
            
          register.json()
            .then(register_token => {
              this.loginUser(register_token, 'register-form');
          });
      })
    });
  }

}