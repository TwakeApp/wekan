// create function to generate password for wekan
var sha512 = require('js-sha512');
generatePsw = function(username,userId,groupId){
    var hash = userId + sha512(groupId+username);
    return hash;
}
