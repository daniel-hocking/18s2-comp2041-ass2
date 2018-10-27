import { showLoading, hideLoading } from './helpers.js';

const API_URL = 'http://localhost:5000/'

export default class API {

    constructor(url = API_URL) {
        this.url = url;
    }
    
    makeApiRequest(path, options, show = true) {
      if(show)
        showLoading();
      return fetch(this.url + path, options)
        .then(res => {
          hideLoading();
          return res;
        })
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    }

    makeApiJsonRequest(path, options, show = true) {
      return this.makeApiRequest(path, options, show)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    }
    
    makeApiStatusRequest(path, options, show = true) {
      return this.makeApiRequest(path, options, show)
        .then(res => res.status)
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    }

    checkLogin(username, password) {
        return this.makeApiRequest('auth/login', {
          method: "POST",
          body: JSON.stringify({
            "username": username,
            "password": password
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
    }
    
    registerUser(register_username, register_password, register_email, register_name) {
        return this.makeApiRequest('auth/signup', {
          method: "POST",
          body: JSON.stringify({
            "username": register_username,
            "password": register_password,
            "email": register_email,
            "name": register_name,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
    }
    
    updateUser(token, name, email, password) {
      let body_object = {
        "name": name,
        "email": email
      };
      if(password) {
        body_object["password"] = password;
      }
      return this.makeApiRequest('user', {
        method: "PUT",
        body: JSON.stringify(body_object),
        headers: {
          "Authorization": "Token " + token,
          "Content-Type": "application/json",
        },
      });
    }

    getFeed(token, p = 0, n = 4) {
      const query_string = '?p=' + p + '&n=' + n;
        return this.makeApiJsonRequest('user/feed' + query_string, {
          headers: {
            "Authorization": "Token " + token,
          },
        }, p === 0);
    }

    getPost(token, post_id, show = true) {
        return this.makeApiJsonRequest('post?id=' + post_id, {
          headers: {
            "Authorization": "Token " + token,
          },
        }, show);
    }
    
    getPosts(token, post_ids, show = true) {
      const promises = [];
      for(const post_id of post_ids) {
        promises.push(this.makeApiJsonRequest('post?id=' + post_id, {
          headers: {
            "Authorization": "Token " + token,
          },
        }, show));
      }
      return Promise.all(promises);
    }
    
    deletePost(token, post_id) {
        return this.makeApiJsonRequest('post?id=' + post_id, {
          method: "DELETE",
          headers: {
            "Authorization": "Token " + token,
          },
        });
    }
    
    getUser(token, user_id = null, user_name = null, show = true) {
      let query_string = '';
      if(user_id) {
        query_string = '?id=' + user_id;
      } else if(user_name) {
        query_string = '?username=' + user_name;
      }
      return this.makeApiJsonRequest('user' + query_string, {
        headers: {
          "Authorization": "Token " + token,
        },
      }, show);
    }
    
    likePost(token, post_id) {
      return this.makeApiJsonRequest('post/like?id=' + post_id, {
        method: "PUT",
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }
    
    unlikePost(token, post_id) {
      return this.makeApiJsonRequest('post/unlike?id=' + post_id, {
        method: "PUT",
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }
    
    followUser(token, username) {
      return this.makeApiRequest('user/follow?username=' + username, {
        method: "PUT",
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }
    
    unFollowUser(token, username) {
      return this.makeApiRequest('user/unfollow?username=' + username, {
        method: "PUT",
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }
    
    postComment(token, post_id, comment) {
        return this.makeApiJsonRequest('post/comment?id=' + post_id, {
          method: "PUT",
          headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "published": (new Date).getTime(),
            "comment": comment,
          }),
        });
    }
    
    createPost(token, desc, img) {
        return this.makeApiRequest('post', {
          method: "POST",
          headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "description_text": desc,
            "src": img,
          }),
        });
    }
    
    updatePost(token, desc, img, post_id) {
        return this.makeApiRequest('post?id=' + post_id, {
          method: "PUT",
          headers: {
            "Authorization": "Token " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "description_text": desc,
            "src": img,
          }),
        });
    }

}
