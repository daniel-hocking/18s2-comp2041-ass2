// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://localhost:5000/'

/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
    constructor(url = API_URL) {
        this.url = url;
    }
    
    makeApiRequest(path, options) {
      return fetch(this.url + path, options)
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    }

    makeApiJsonRequest(path, options) {
      return this.makeApiRequest(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
    }
    
    makeApiStatusRequest(path, options) {
      return this.makeApiRequest(path, options)
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
    
    reigtserUser(register_username, register_password, register_email, register_name) {
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

    /**
     * @returns feed array in json format
     */
    getFeed(token) {
        return this.makeApiJsonRequest('user/feed', {
          headers: {
            "Authorization": "Token " + token,
          },
        });
    }

    getPost(token, post_id) {
        return this.makeApiJsonRequest('post?id=' + post_id, {
          headers: {
            "Authorization": "Token " + token,
          },
        });
    }
    
    getUser(token, user_id = null, user_name = null) {
      let query_string;
      if(user_id) {
        query_string = '?id=' + user_id;
      } else {
        query_string = '?username=' + user_name;
      }
      return this.makeApiJsonRequest('user' + query_string, {
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }
    
    likePost(token, post_id) {
      return this.makeApiJsonRequest('post/like?id=' + post_id, {
        method: "PUT",
        headers: {
          "Authorization": "Token " + token,
        },
      });
    }

}
