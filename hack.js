People = new Meteor.Collection("people_does_not_matter");
Connections = new Meteor.Collection('connections_collection');

if (Meteor.isClient) {
  // Template.hello.greeting = function () {
  //   return "Welcome to hack.";
  // };

  Template.hackboard.events({
    'submit form.add-user-form': function () {
      console.log('adding something', $('.twitter-handle').val());
        var name = $('.twitter-handle').val();
        var location = $('.location').val();
        console.log('updating with name, session', name, Session.get('user_id'));
        if (Session.get('user_id')) {
          People.update({_id: Session.get('user_id')}, {name: name, location:location});
        } else {
          People.insert({name:name, location:location}, function(error, _id) {
            console.log('added new name', error, _id);
            Session.set('user_id', _id);
          });
        }

        return false;
    },
    'click .logout': function() {
      People.remove({_id: Session.get('user_id')});
      Session.set('user_id', null);
    }
  });

  Template.hackboard.people = function() {
    return People.find({});
  };

  // Template.hello.events({
  //   'click input' : function () {
  //     console.log("You pressed the button");
  //    });
  //   });
  Meteor.setInterval(function() {
    console.log('updating connection');
    if (Connections.findOne({_id: Session.get('user_id')})) {
      Connections.update({_id: Session.get('user_id')}, {'keepalive': (new Date()).getTime()});
    } else {
      Connections.insert({_id: Session.get('user_id'), 'keepalive': (new Date()).getTime()});
    }
  }, 1000);
}



if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (People.find().count() === 0) {
      console.log('populating');
      var names = ["Chase Lambert",
                    "Adam Chu"];
      var loc = ["Maseeh Basement", "Wormhole"];
      for (var i = 0; i < names.length; i++) {
        People.insert({name: names[i], location: loc[i]});
      }
    }
    

  });
  Meteor.publish('people_does_not_matter', function() {
    this.session.socket.on('close', function() {console.log('closing')});
  });

  Meteor.setInterval(function() {
    var oldNames = Connections.find({'keepalive':{$lt: (new Date()).getTime() - 1500}}) // list of collections, of which have associated ids to delete
    oldNames.forEach(function(oldPerson) {
      People.remove({'_id': oldPerson._id});
      Connections.remove({'_id': oldPerson._id});
    });
  }, 1000);

}
