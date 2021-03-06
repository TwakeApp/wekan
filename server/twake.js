import { Random } from 'meteor/random'
var urlTwakeApi = Meteor.settings.urlTwakeApi;
var publicKey = Meteor.settings.publicKey;
var privateKey = Meteor.settings.privateKey;

Meteor.methods({
    connectServer: function(token,groupId) {

        check(token,String);
        check(groupId,String);
        function createUsers(groupId,secret,base){
            param = base;
            param.data = {fields : ["userId","username","userImage","lastname","firstname"]};

            var resultGroup = HTTP.call('POST',urlTwakeApi+"group/users",{data:param});
            var data = resultGroup.data.data;
            console.log(data);
            for(var i=0;i<data.length;i++){
                var profileUser = {
                    workspace : groupId,
                    fullname: data[i].firstname+" "+data[i].lastName,
                    avatarUrl : data[i].userImage,
                    isAdmin : true,
                };
                var account = Accounts.findUserByUsername(data[i].id+"_"+groupId);
                if(account){
                    var profileUser = account.profile;
                    profileUser.group = groupId;
                    profileUser.fullname = data[i].firstname+" "+data[i].lastName;
                    profileUser.avatarUrl = data[i].userImage;
                    profileUser.userId = data[i].id;
                }
                else{
                    var profileUser;
                    profileUser.group = groupId;
                    profileUser.fullname = data[i].username;
                    profileUser.avatarUrl = data[i].userImage;
                    profileUser.userId = data[i].id;
                    Accounts.createUser({
                        username : data[i].id+"_"+groupId,
                        password: generatePsw(data[i].id,groupId,secret),
                        group : groupId,
                        profile : profileUser,
                    });
                    account = Accounts.findUserByUsername(data[i].id+"_"+groupId);
                }
                Meteor.users.update(account, {$set: {profile: profileUser}});
            }
        }
        if(Meteor.userId() == null){
            var base = {
                "global" : {
                    "publicKey" : publicKey,
                    "privateKey" : privateKey,
                    "groupId" : groupId
                },
                "data" : {
                }
            };
            var param = base;
            param.data = {token : token};
            console.log(Meteor.settings.urlTwakeApi);
            console.log(urlTwakeApi);
            var result = HTTP.call('POST',urlTwakeApi+"users/current/verify",{data:param});
            if(result.data.errors.length === 0){
                var account = Accounts.findUserByUsername(result.data.data.userId+"_"+groupId);
                var group = Groups.findOne({groupId : groupId});
                if(!group){
                    var secret = Random.secret();
                    var gid = Groups.insert({ groupId : groupId, token : secret });
                }
                else{
                    var secret = group.token;
                }
                createUsers(groupId,secret,base);
                return {username : result.data.data.userId+"_"+groupId,password:generatePsw(result.data.data.userId,groupId,secret)};
            }
            else{
                return "error http : "+result.data.errors;
            }
        }
        else{
            return "already logged";
        }
    }
});
