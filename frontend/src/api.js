// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://localhost:5000'

const getJSON = (path, options) => 
    fetch(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));
        
const getStatusCode = (path, options) =>
    fetch(path, options)
        .then(res => res.status)
        .catch(err => console.warn(`API_ERROR: ${err.message}`));

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

    makeAPIRequest(path, options, status) {
        if(status) {
          return getStatusCode(`${this.url}/${path}`, options);
        }
        return getJSON(`${this.url}/${path}`, options);
    }

    checkLogin(username, password) {
        return this.makeAPIRequest('auth/login', {
          method: "POST",
          body: JSON.stringify({
            "username": username,
            "password": password
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }, true);
    }

    /**
     * @returns feed array in json format
     */
    getFeed() {
        return this.makeAPIRequest('dummy/post?id=1');
    }

    /**
     * @returns auth'd user in json format
     */
    getMe() {
        return this.makeAPIRequest('me.json');
    }

}
