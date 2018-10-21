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
      post_title.appendChild(helpers.createElement('span', helpers.formatDate(parseInt(post.meta.published) * 1000), { class: 'post-date'}));

      section.appendChild(helpers.createElement('img', null, 
          { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'post-image' }));

      const post_footer = section.appendChild(helpers.createElement('div', null, { class: 'post-footer'}));
      
      post_footer.appendChild(helpers.createElement('span', post.meta.description_text, { class: 'post-desc' }));
      
      const like_comment = helpers.createElement('span', null, { class: 'post-like-comments' });
      const like_badge = helpers.createElement('span', `Likes: ${post.meta.likes.length}`, { id: 'likes-badge-' + post.id, class: 'badge clickable' });
      like_badge.addEventListener('click', this.viewPostLikes.bind(this, post.id));
      like_comment.appendChild(like_badge);
      const comment_badge = helpers.createElement('span', `Comments: ${post.comments.length}`, { id: 'comments-badge-' + post.id, class: 'badge clickable' });
      comment_badge.addEventListener('click', this.viewPostComments.bind(this, post.id));
      like_comment.appendChild(comment_badge);
      post_footer.appendChild(like_comment);

      return section;
  }
  
  viewPostLikes(post_id) {
    const likers_list = helpers.createElement('div', null, { id: 'likers-list' });
    const like_button_div = helpers.createElement('div', null, { id: 'like-button-div' });
    helpers.createModal('Likes', likers_list, like_button_div);
    this.api.getPost(this.token, post_id)
      .then(post => {
        let num_likes = post.meta.likes.length;
        let current_user_found = false;
        let current_username = helpers.checkStore('username');
        this.setupLikeUnButton(like_button_div, num_likes, current_user_found, post);
        for(const user_id of post.meta.likes) {
          this.api.getUser(this.token, user_id)
            .then(user => {
              likers_list.appendChild(helpers.createElement('span', user.username, { class: 'badge' }));
              
              num_likes -=1;
              if(current_username === user.username)
                current_user_found = true;
              this.setupLikeUnButton(like_button_div, num_likes, current_user_found, post);
            });
        }
    });
  }
  
  setupLikeUnButton(like_button_div, num_likes, current_user_found, post) {
    if(num_likes === 0) {
      if(current_user_found) {
        const unlike_button = helpers.createElement('button', 'I hate this', { type: 'button', class: 'btn', 'data-dismiss': 'modal' });
        unlike_button.addEventListener('click', this.unlikePost.bind(this, post.id, post.meta.likes.length));
        like_button_div.appendChild(unlike_button);
      } else {
        const like_button = helpers.createElement('button', 'I like this', { type: 'button', class: 'btn', 'data-dismiss': 'modal' });
        like_button.addEventListener('click', this.likePost.bind(this, post.id, post.meta.likes.length));
        like_button_div.appendChild(like_button);
      }
    }
  }
  
  likePost(post_id, num_likes) {
    this.api.likePost(this.token, post_id)
      .then(response => {
        if(response.message === 'success')
          document.getElementById('likes-badge-' + post_id).innerText = `Likes: ${num_likes + 1}`;
      });
    
  }
  
  unlikePost(post_id, num_likes) {
    this.api.unlikePost(this.token, post_id)
      .then(response => {
        if(response.message === 'success')
          document.getElementById('likes-badge-' + post_id).innerText = `Likes: ${num_likes - 1}`;
      });
  }
  
  viewPostComments(post_id) {
    const comments_div = helpers.createElement('div', null, { id: 'comments-div' });
    const new_comment_div = helpers.createElement('div', null, { id: 'new-comment-div' });
    new_comment_div.appendChild(helpers.createElement('input', null, { id: 'new-comment-text', type: 'text' }));
    const new_comment_button = helpers.createElement('button', 'Post comment', { id: 'new-comment-button', type: 'button', class: 'btn', 'data-dismiss': 'modal' });
    new_comment_div.appendChild(new_comment_button);
    helpers.createModal('Comments', comments_div, new_comment_div);
    this.api.getPost(this.token, post_id)
      .then(post => {
        new_comment_button.addEventListener('click', this.postComment.bind(this, post_id, post.comments.length));
        for(const comment of post.comments) {
          const comment_div = helpers.createElement('div', null, { class: 'comment-div' });
          const comment_header = helpers.createElement('div');
          comment_header.appendChild(helpers.createElement('span', comment.author, { class: 'badge' }));
          comment_header.appendChild(helpers.createElement('div', helpers.formatDate(parseInt(comment.published) * 1000), { class: 'float-right' }));
          comment_div.appendChild(comment_header);
          comment_div.appendChild(helpers.createElement('div', comment.comment));
          comments_div.appendChild(comment_div);
        }
      });
  }
  
  postComment(post_id, num_comments) {
    const comment = document.getElementById('new-comment-text').value;
    console.log(this.token, post_id, comment);
    this.api.postComment(this.token, post_id, comment)
      .then(response => {
        if(response.message === 'success')
          document.getElementById('comments-badge-' + post_id).innerText = `Comments: ${num_comments + 1}`;
      });
  }
}