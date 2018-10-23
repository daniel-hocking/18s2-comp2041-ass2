import * as helpers from './helpers.js';
import API from './api.js';

export default class Post {
  
  constructor(user) {
    this.api = new API();
    this.token = user.token;
    this.user = user;
    this.current_image = null;
    this.can_update_feed = false;
    this.next_scroll_point = 0;
    this.posts_p = 0;
    
    document.getElementById('create-post-btn').addEventListener('click', this.createPostForm.bind(this, null));
    window.addEventListener('scroll', this.updateFeedOnScroll.bind(this));
  }
  
  updateFeedOnScroll() {
    if(this.can_update_feed && (window.pageYOffset + window.innerHeight) > this.next_scroll_point) {
      this.can_update_feed = false;
      this.loadFeed(2);
    }
  }
  
  displayFeed() {
    const html_tag = document.getElementById('html-tag');
    html_tag.classList.add('auth');
    html_tag.classList.remove('not-auth');

    document.getElementById('logout-btn').addEventListener('click', this.user.logoutCurrentUser);
    
    this.loadFeed();
  }
  
  loadFeed(num_posts = 4, feed_id = 'large-feed') {
    this.api.getFeed(this.token, this.posts_p, num_posts)
      .then(posts => {
        console.log(posts);
        if(posts && posts['posts'].length) {
          posts['posts'].reduce((parent, post) => {
            parent.appendChild(this.createPostTile(post));
            return parent;
          }, document.getElementById(feed_id));
          
          this.next_scroll_point = document.body.scrollHeight - window.innerHeight - 250;
          this.posts_p += num_posts;
          this.can_update_feed = true;
          console.log(this.posts_p, this.next_scroll_point);
        }
      });
  }
  
  /**
   * Given a post, return a tile with the relevant data
   * @param   {object}        post 
   * @returns {HTMLElement}
   */
  createPostTile(post, full_post = true, editable = false) {
      const section = helpers.createElement('section', null, { class: 'post' });

      const post_title = section.appendChild(helpers.createElement('h2', post.meta.author, { class: 'post-title clickable' }));
      if(full_post)
        post_title.addEventListener('click', this.loadUserPage.bind(this, post.meta.author));
      post_title.appendChild(helpers.createElement('span', helpers.formatDate(parseInt(post.meta.published) * 1000), { class: 'post-date'}));

      const img_element = section.appendChild(helpers.createElement('img', null, 
          { src: 'data:image/png;base64,'+post.src, alt: post.meta.description_text, class: 'post-image clickable' }));
      if(full_post)
        img_element.addEventListener('click', this.loadUserPage.bind(this, post.meta.author));

      const post_footer = section.appendChild(helpers.createElement('div', null, { class: 'post-footer'}));
      
      post_footer.appendChild(helpers.createElement('span', post.meta.description_text, { class: 'post-desc' }));
      
      const like_comment = helpers.createElement('span', null, { class: 'post-like-comments' });
      const like_badge = helpers.createElement('span', `Likes: ${post.meta.likes.length}`, { id: 'likes-badge-' + post.id, class: 'badge clickable' });
      if(full_post)
        like_badge.addEventListener('click', this.viewPostLikes.bind(this, post.id));
      like_comment.appendChild(like_badge);
      const comment_badge = helpers.createElement('span', `Comments: ${post.comments.length}`, { id: 'comments-badge-' + post.id, class: 'badge clickable' });
      if(full_post)
        comment_badge.addEventListener('click', this.viewPostComments.bind(this, post.id));
      like_comment.appendChild(comment_badge);
      post_footer.appendChild(like_comment);
      
      if(editable) {
        const edit_post_button = section.appendChild(helpers.createElement('button', 'Edit post', { type: 'button', class: 'btn', 'data-dismiss': 'modal' }));
        console.log(edit_post_button);
        edit_post_button.addEventListener('click', this.createPostFormSoon.bind(this, post));
      }

      return section;
  }
  
  loadUserPage(author) {
    this.user.createProfilePage(author);
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
  
  createPostFormSoon(post) {
    $('#modal-popup').on('hidden.bs.modal', this.createPostForm.bind(this, post));
  }
  
  createPostForm(post) {
    this.current_image = post ? post.src : null
    const create_post_div = helpers.createElement('div', null, { id: 'create-post-div' });
    const create_post_messages = helpers.createElement('div', null, { id: 'create-post-messages' });
    const description_input = helpers.createElement('input', null, { id: 'description-input', type: 'text', placeholder: 'Post description', value: post ? post.meta.description_text : '' });
    const upload_image_input = helpers.createElement('input', null, { id: 'upload-image-input', type: 'file' });
    upload_image_input.addEventListener('change', this.imageUploaded.bind(this));
    create_post_div.appendChild(create_post_messages);
    create_post_div.appendChild(description_input);
    create_post_div.appendChild(helpers.createElement('br'));
    create_post_div.appendChild(helpers.createElement('br'));
    create_post_div.appendChild(upload_image_input);
    const post_text = post ? 'Update post' : 'Create post';
    const new_post_button = helpers.createElement('button', post_text, { id: 'new-post-button', type: 'button', class: 'btn' });
    const post_id = post ? post.id : null;
    new_post_button.addEventListener('click', this.createPostSubmit.bind(this, post_id));
    helpers.createModal(post_text, create_post_div, new_post_button);
  }
  
  imageUploaded(event) {
    const [ file ] = event.target.files;

    const validFileTypes = [ 'image/png' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
      return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // do something with the data result
      let data_url = e.target.result;
      this.current_image = data_url.replace(/data:image\/png;base64,/, '');
    };

    // this returns a base64 image
    reader.readAsDataURL(file);
  }
  
  createPostSubmit(post_id) {
    const post_desc = document.getElementById('description-input').value;
    if(!post_desc || !this.current_image) {
      helpers.createAlert('You must enter both a description and select an image before you can create a post.', 'create-post-messages');
      return false;
    }
    
    if(post_id) {
      this.api.updatePost(this.token, post_desc, this.current_image, post_id);
    } else {
      this.api.createPost(this.token, post_desc, this.current_image);
    }
    $('#modal-popup').modal('hide');
  }
}