var urlTwakeApi = Meteor.settings.urlTwakeApi
var publicKey = Meteor.settings.publicKey;
var privateKey = Meteor.settings.privateKey;

Meteor.methods({
    connectServer: function(token,groupId) {

        check(token,String);
        check(groupId,String);
        if(Meteor.userId() == null){
            var param = {
                "global" : {
                    "publicKey" : publicKey,
                    "privateKey" : privateKey,
                    "groupId" : groupId
                },
                "data" : {
                    token : token
                }
            };
            var result = HTTP.call('POST',urlTwakeApi+"users/current/verify",{data:param});
            if(result.data.errors.length === 0){
                var account = Accounts.findUserByUsername(result.data.data.username+""+groupId);
                if(account == null){
                    var data = {
                        group : groupId,
                        fullname:result.data.data.username,
                        avatarUrl : result.data.data.userImage,
                    };
                    Accounts.createUser({
                        username : result.data.data.username+""+groupId,
                        password: generatePsw(result.data.data.username,result.data.data.userId,groupId),
                        group : groupId,
                        profile : data,
                    });
                    account = Accounts.findUserByUsername(result.data.data.username+""+groupId);
                    Meteor.users.update(account, {$set: {profile: data}});
                }
                return {username : result.data.data.username+""+groupId,password:generatePsw(result.data.data.username,result.data.data.userId,groupId)};
            }
            else{
                return "error http : "+result.data.errors;
            }
        }
        else{
            return "already loggede";
        }
    }
});
