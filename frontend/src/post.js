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

              parent.appendChild(this.createPostTile(post));
              
              return parent;

          }, document.getElementById('large-feed'))
        } else {
          document.getElementById('large-feed').appendChild(this.createPostTile(posts));
        }
    });
  }
  
  /**
   * Given a post, return a tile with the relevant data
   * @param   {object}        post 
   * @returns {HTMLElement}
   */
  createPostTile(post) {
      const section = helpers.createElement('section', null, { class: 'post' });

      const post_title = section.appendChild(helpers.createElement('h2', post.meta.author, { class: 'post-title' }));
      post_title.appendChild(helpers.createElement('span', helpers.formatDate(parseInt(post.meta.published)), { class: 'post-date'}));

      section.appendChild(helpers.createElement('img', null, 
          { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'post-image' }));

      const post_footer = section.appendChild(helpers.createElement('div', null, { class: 'post-footer'}));
      
      post_footer.appendChild(helpers.createElement('span', post.meta.description_text, { class: 'post-desc' }));
      
      const like_comment = helpers.createElement('span', null, { class: 'post-like-comments' });
      const like_badge = helpers.createElement('span', `Likes: ${post.meta.likes.length}`, { class: 'badge clickable' });
      like_badge.addEventListener('click', this.viewPostLikes.bind(this, post.id));
      like_comment.appendChild(like_badge);
      const comment_badge = helpers.createElement('span', `Comments: ${post.comments.length}`, { class: 'badge clickable' });
      comment_badge.addEventListener('click', this.viewPostComments.bind(this, post.id));
      like_comment.appendChild(comment_badge);
      post_footer.appendChild(like_comment);

      return section;
  }
  
  viewPostLikes(post_id) {
    const likers_list = helpers.createElement('ul', null, { id: 'likers-list' });
    const like_button = helpers.createElement('button', 'I like this', { type: 'button', class: 'btn', 'data-dismiss': 'modal' });
    like_button.addEventListener('click', this.likePost.bind(this, post_id));
    helpers.createModal('Likes', likers_list, like_button);
    this.api.getPost(this.token, post_id)
      .then(post => {
        for(const user_id of post.meta.likes) {
          this.api.getUser(this.token, user_id)
            .then(user => {
              likers_list.appendChild(helpers.createElement('li', user.username));
            });
        }
      });
  }
  
  likePost(post_id) {
    this.api.likePost(this.token, post_id);
  }
  
  viewPostComments(post_id) {
    const comments_div = helpers.createElement('div', null, { id: 'comments-div' });
    helpers.createModal('Comments', comments_div);
    this.api.getPost(this.token, post_id)
      .then(post => {
        for(const comment of post.comments) {
          comments_div.appendChild(helpers.createElement('p', comment.comment));
        }
      });
  }
}