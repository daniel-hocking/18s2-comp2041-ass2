// when importing 'default' exports, use below syntax
import User from './user.js';


(function() {
    const user = new User();
    
    if(!user.token) {
      user.createLoginForm();
    } else {
      user.post.displayFeed();
    }
}());
