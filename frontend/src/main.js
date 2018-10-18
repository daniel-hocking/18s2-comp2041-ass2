// when importing 'default' exports, use below syntax
import User from './user.js';


(function() {
    const user = new User();
    
    let token = user.checkToken();
    if(!token) {
      user.createLoginForm();
    } else {
      user.displayFeed();
    }
}());
