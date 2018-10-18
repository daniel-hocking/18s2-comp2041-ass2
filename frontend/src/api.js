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

    /**
     * @returns feed array in json format
     */
    getFeed() {
        return this.makeApiJsonRequest('dummy/post?id=1');
    }

    /**
     * @returns auth'd user in json format
     */
    getMe() {
        return this.makeApiJsonRequest('me.json');
    }

}
