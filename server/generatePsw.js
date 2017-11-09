// create function to generate password for wekan
var sha512 = require('js-sha512');
generatePsw = function(userId,groupId,token){
    var hash = sha512(userId+groupId+token);
    return hash;
}
