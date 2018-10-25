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
    document.getElementById('view-profile-btn').addEventListener('click', this.createProfilePage.bind(this, null));
    document.getElementById('follow-user-btn').addEventListener('click', this.createFollowForm.bind(this));
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
  
  loginUser(token, username, form_id) {
    console.log(token);
    this.setToken(token.token);
    helpers.setStore('username', username);
    helpers.removeFrom('main-section', form_id);
    
    this.post = new Post(this);
    this.post.displayFeed();
  }
  
  showUserPageSoon(author) {
    const current_username = helpers.checkStore('username');
    author = current_username === author ? null : author;
    $('#modal-popup').modal('hide');
    $('#modal-popup').on('hidden.bs.modal', this.createProfilePage.bind(this, author));
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
  
  createProfilePage(profile_username) {
    console.log(profile_username);
    const my_profile = profile_username === null ? true : false;
    const profile_div = helpers.createElement('div', null, { id: 'profile-div', class: 'profile-div' });
    const basics_fieldset = helpers.createElement('fieldset', null, { id: 'basics-profile-fieldset' });
    basics_fieldset.appendChild(helpers.createElement('legend', 'Basic details'));
    const following_fieldset = helpers.createElement('fieldset', null, { id: 'following-profile-fieldset' });
    following_fieldset.appendChild(helpers.createElement('legend', 'Following'));
    const posts_fieldset = helpers.createElement('fieldset', null, { id: 'posts-profile-fieldset' });
    posts_fieldset.appendChild(helpers.createElement('legend', 'Posts'));
    
    profile_div.appendChild(basics_fieldset);
    profile_div.appendChild(following_fieldset);
    profile_div.appendChild(posts_fieldset);
    
    this.api.getUser(this.token, null, profile_username)
      .then(user => {
        if(my_profile) {
          basics_fieldset.appendChild(helpers.createElement('div', 'Username: ' + user.username, { class: 'spaced-item' }));
          const name_input = helpers.createElement('input', null, { id: 'name-profile-input', type: 'text', placeholder: 'name', value: user.name });
          basics_fieldset.appendChild(helpers.createElement('div', 'Name: ', { class: 'spaced-item' }, name_input));
          const email_input = helpers.createElement('input', null, { id: 'email-profile-input', type: 'text', placeholder: 'email', value: user.email });
          basics_fieldset.appendChild(helpers.createElement('div', 'Email: ', { class: 'spaced-item' }, email_input));
          const password_input = helpers.createElement('input', null, { id: 'password-profile-input', type: 'password', placeholder: 'password' });
          basics_fieldset.appendChild(helpers.createElement('div', 'Password: ', { class: 'spaced-item' }, password_input));
          
          const update_profile_button = helpers.createElement('button', 'Update profile', { id: 'update-profile-button', type: 'button', class: 'btn', 'data-dismiss': 'modal' });
          update_profile_button.addEventListener('click', this.updateProfile.bind(this));
          basics_fieldset.appendChild(update_profile_button);
        } else {
          basics_fieldset.appendChild(helpers.createElement('div', 'Username: ' + user.username, { class: 'spaced-item' }));
          basics_fieldset.appendChild(helpers.createElement('div', 'Name: ' + user.name, { class: 'spaced-item' }));
          basics_fieldset.appendChild(helpers.createElement('div', 'Email: ' + user.email, { class: 'spaced-item' }));
        }
        
        if(user.following.length === 0) {
          following_fieldset.appendChild(helpers.createElement('div', 'Nobody yet', { class: 'spaced-item' }));
        } else {
          for(const user_id of user.following) {
            this.api.getUser(this.token, user_id)
              .then(followed_user => {
                const user_badge = following_fieldset.appendChild(helpers.createElement('span', followed_user.username, { class: 'badge clickable-name' }));
                user_badge.addEventListener('click', this.showUserPageSoon.bind(this, followed_user.username));
              });
          }
        }
        
        if(user.posts.length === 0) {
          posts_fieldset.appendChild(helpers.createElement('div', 'None yet', { class: 'spaced-item' }));
        } else {
          let total_likes = 0;
          posts_fieldset.appendChild(helpers.createElement('span', 'Total posts: ' + user.posts.length, { class: 'badge' }));
          const likes_badge = helpers.createElement('span', 'Total likes: ' + total_likes, { class: 'badge' });
          posts_fieldset.appendChild(likes_badge);
          const profile_posts_div = posts_fieldset.appendChild(helpers.createElement('div', null, { class: 'profile-posts-div' }));
          for(const post_id of user.posts) {
            this.api.getPost(this.token, post_id)
              .then(post => {
                total_likes += post.meta.likes.length;
                likes_badge.innerText = 'Total likes: ' + total_likes;
                profile_posts_div.appendChild(this.post.createPostTile(post, false, my_profile));
              });
          }
        }
        
        if(!my_profile) {
          this.addUnFollowButton(user.id, profile_username);
        }
      });
      
    const follow_div = helpers.createElement('div', null, { id: 'follow-btn-div' });
    helpers.createModal(my_profile ? 'My profile' : profile_username + '\'s profile', profile_div, null, follow_div);
  }
  
  createFollowForm() {
    const follow_form = helpers.createElement('div', null, { id: 'follow-form', class: 'follow-form' });
    follow_form.appendChild(helpers.createElement('input', null, { id: 'follow-username', type: 'text', name: 'follow_username', placeholder: 'User to follow' }));
    const follow_button = helpers.createElement('button', 'Follow user', { class: 'btn' });
    follow_button.addEventListener('click', this.onFollowSubmit.bind(this));
    
    helpers.createModal('Follow user', follow_form, follow_button);
  }
  
  onFollowSubmit() {
    const username = document.getElementById('follow-username').value;
    if(username.length === 0) {
      helper.createAlert('You must enter a user to follow.', 'modal-messages');
      return false;
    }
    
    this.followUser(username);
  }
  
  addUnFollowButton(user_id, username) {
    this.api.getUser(this.token, null, helpers.checkStore('username'))
      .then(user => {
        const follow_div = document.getElementById('follow-btn-div');
        follow_div.innerHTML = '';
        if(user.following.filter((id)=> id == user_id).length) {
          const unfollow_button = follow_div.appendChild(helpers.createElement('button', 'Unfollow', { class: 'btn btn-warning follow-btn' }));
          unfollow_button.addEventListener('click', this.unFollowUser.bind(this, username, user_id));
        } else {
          const follow_button = follow_div.appendChild(helpers.createElement('button', 'Follow', { class: 'btn btn-primary follow-btn' }));
          follow_button.addEventListener('click', this.followUser.bind(this, username, user_id));
        }
      });
  }
  
  unFollowUser(username, user_id) {
    const message_id = user_id ? 'modal-messages' : 'message-box';
    this.api.unFollowUser(this.token, username)
      .then(follow => {
          if(follow.status !== 200) {
            if(follow.status === 400) {
              helpers.createAlert('Malformed Request.', message_id);
            } else if(follow.status === 403) {
              helpers.createAlert('Invalid Auth Token.', message_id);
            } else if(follow.status === 404) {
              helpers.createAlert('User Not Found.', message_id);
            } else {
              helpers.createAlert('An error occurred when submitting the unfollow form.', message_id);
            }
            return false;
          }
          
          helpers.createAlert('The user: ' + username + ' has been unfollowed.', message_id, 'success');
          if(user_id) {
            this.addUnFollowButton(user_id, username);
          } else {
            $('#modal-popup').modal('hide');
          }
      });
  }
  
  followUser(username, user_id) {
    const message_id = user_id ? 'modal-messages' : 'message-box';
    this.api.followUser(this.token, username)
      .then(follow => {
          if(follow.status !== 200) {
            if(follow.status === 400) {
              helpers.createAlert('Malformed Request.', message_id);
            } else if(follow.status === 403) {
              helpers.createAlert('Invalid Auth Token.', message_id);
            } else if(follow.status === 404) {
              helpers.createAlert('User Not Found.', message_id);
            } else {
              helpers.createAlert('An error occurred when submitting the follow form.', message_id);
            }
            return false;
          }
          
          helpers.createAlert('The user: ' + username + ' has been followed.', message_id, 'success');
          if(user_id) {
            this.addUnFollowButton(user_id, username);
          } else {
            $('#modal-popup').modal('hide');
          }
      });
  }
  
  updateProfile() {
    const name_val = document.getElementById('name-profile-input').value;
    const email_val = document.getElementById('email-profile-input').value;
    const password_val = document.getElementById('password-profile-input').value;
    
    this.api.updateUser(this.token, name_val, email_val, password_val);
  }
  
  onSubmitLoginForm() {
    document.getElementById('login-submit').addEventListener('click', ()=> {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      if(username.length === 0 || password.length === 0) {
          helpers.createAlert('Please enter a username and password.', 'message-box');
          return false;
      }
      
      this.api.checkLogin(username, password)
        .then(login => {
          if(login.status !== 200) {
            if(login.status === 400) {
              helpers.createAlert('Missing Username/Password.', 'message-box');
            } else if(login.status === 403) {
              helpers.createAlert('Invalid Username/Password.', 'message-box');
            } else {
              helpers.createAlert('An error occurred when submitting the login form.', 'message-box');
            }
            return false;
          }
            
          login.json()
            .then(login_token => {
              this.loginUser(login_token, username, 'login-form');
          });
      });
    });
  }
  
  onSubmitRegisterForm() {
    document.getElementById('register-submit').addEventListener('click', ()=> {
      const register_username = document.getElementById('register-username').value;
      const register_password = document.getElementById('register-password').value;
      const register_email = document.getElementById('register-email').value;
      const register_name = document.getElementById('register-name').value;
      
      if(register_username.length === 0 || register_password.length === 0 || 
        register_email.length === 0 || register_name.length === 0) {
          helpers.createAlert('Please enter a value into each of the fields.', 'message-box');
          return false;
      }
      if(!helpers.validateEmail(register_email)) {
        helpers.createAlert('Invalid email address.', 'message-box');
        return false;
      }

      this.api.reigtserUser(register_username, register_password, register_email, register_name)
        .then(register => {
          if(register.status !== 200) {
            if(register.status === 400) {
              helpers.createAlert('Missing Username/Password.', 'message-box');
            } else if(register.status === 409) {
              helpers.createAlert('The provided username was already taken.', 'message-box');
            } else {
              helpers.createAlert('An error occurred when submitting the registration form.', 'message-box');
            }
            return false;
          }
            
          register.json()
            .then(register_token => {
              this.loginUser(register_token, register_username, 'register-form');
          });
      })
    });
  }

}