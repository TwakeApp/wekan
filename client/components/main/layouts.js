Meteor.subscribe('boards');
Meteor.subscribe('setting');
Meteor.subscribe('user-admin');

BlazeLayout.setRoot('body');

const i18nTagToT9n = (i18nTag) => {
  // t9n/i18n tags are same now, see: https://github.com/softwarerero/meteor-accounts-t9n/pull/129
  // but we keep this conversion function here, to be aware that that they are different system.
  return i18nTag;
};

Meteor.startup(() => {
    function $_GET(param) {
        var vars = {};
        window.location.href.replace( location.hash, '' ).replace(
            /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
            function( m, key, value ) { // callback
                vars[key] = value !== undefined ? value : '';
            }
        );

        if ( param ) {
            return vars[param] ? vars[param] : null;
        }
        return vars;
    }

    if($_GET("token")){
        AccountsTemplates.logout();
        Meteor.call("connectServer",$_GET("token"),$_GET("groupId"), function(error,result){
            if(error){
                console.log(error);
            }
            else{
                Meteor.loginWithPassword(result.username,result.password,function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        FlowRouter.go('home');
                    }
                });
            }
        });
    }

});


Template.userFormsLayout.onRendered(() => {


    const i18nTag = navigator.language;
    if (i18nTag) {
    T9n.setLanguage(i18nTagToT9n(i18nTag));
    }
    EscapeActions.executeAll();
});

Template.userFormsLayout.helpers({
  languages() {
    return _.map(TAPi18n.getLanguages(), (lang, code) => {
      return {
        tag: code,
        name: lang.name === 'br' ? 'Brezhoneg' : lang.name,
      };
    }).sort(function(a, b) {
      if (a.name === b.name) {
        return 0;
      } else {
        return a.name > b.name ? 1 : -1;
      }
    });
  },

  isCurrentLanguage() {
    const t9nTag = i18nTagToT9n(this.tag);
    const curLang = T9n.getLanguage() || 'en';
    return t9nTag === curLang;
  },
});

Template.userFormsLayout.events({
  'change .js-userform-set-language'(evt) {
    const i18nTag = $(evt.currentTarget).val();
    T9n.setLanguage(i18nTagToT9n(i18nTag));
    evt.preventDefault();
  },
});

Template.defaultLayout.events({
  'click .js-close-modal': () => {
    Modal.close();
  },
});
