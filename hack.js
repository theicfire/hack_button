People = new Meteor.Collection("people_does_not_matter");
Connections = new Meteor.Collection('connections_collection');

if (Meteor.isClient) {
  // Template.hello.greeting = function () {
  //   return "Welcome to hack.";
  // };

  console.log('run this first', $.cookie('user_id'));
  if (!$.cookie('user_id')) {
    console.log('insert this person');
    People.insert({name:'', location:'', mode: 'off'}, function(error, _id) {
      $.cookie('user_id', _id);
    });
  } else {
    Deps.autorun(function() {
        var person = People.findOne({_id: $.cookie('user_id')});
        if (person) {
          console.log('person is', person);
          $('.twitter-handle').val(person.name);
          $('.location').val(person.location);
        } // otherwise no person.. yet! I expect the person will be found soon
      });
  }
  
  // need to always have an associated entry for a user
  Template.name_form.events({
        'keyup .field-updater': function () {
          // while (!Session.get('user_id')) {}
          var name = $('.twitter-handle').val();
          var location = $('.location').val();
          console.log('name, location', name, location);
          console.log('updating with name, session', name, $.cookie('user_id'));

          if ($.cookie('user_id')) {
            console.log('just update');
            People.update({_id: $.cookie('user_id')}, {$set: {name: name, location:location}});
          } else {
            console.log('if this is hit, then the keyup that was just hit is ignored...');
          }
          return false;
        },
        // hack that makes change go to click from hack.html
        'click .hack-button': function() {
          console.log('changing hack button to ', $('.hack-button').val());
          var mode = 'on';
          if ($('.hack-button').val() == 'off') {
            mode = 'off';
          }
          People.update({_id: $.cookie('user_id')}, {$set: {mode: mode}});
        }
  });

  // Template.name_form.twitter_handle = 'kid';
  Template.name_form.twitter_handle = function() {
    // return 'joe';
    global_thing = People.find();
    console.log('found', global_thing.count());
    return 'joe';
  }

  Template.name_form.thing = 'hello sir';
  Template.hackboard.events({
    'click .logout': function() {
      People.remove({_id: $.cookie('user_id')});
      $.cookie('user_id', null);
    }
  });

  Template.hackboard.people = function() {
    // return People.find({}, {sort: -1});
    console.log('people are here', People.find().count());
    // return reverseCollection(People.find({}));
    return People.find();
  };

  Template.hackboard.is_valid_name_location = function(name, location, mode) {
    console.log('is_empty', name, 'and', location, 'mode', mode);
    return mode == 'on';
  }

  // Template.hello.events({
  //   'click input' : function () {
  //     console.log("You pressed the button");
  //    });
  //   });
  Meteor.setInterval(function() {
    console.log('updating connection');
    if (Connections.findOne({_id: $.cookie('user_id')})) {
      Connections.update({_id: $.cookie('user_id')}, {'keepalive': (new Date()).getTime()});
    } else {
      Connections.insert({_id: $.cookie('user_id'), 'keepalive': (new Date()).getTime()});
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
        People.insert({name: names[i], location: loc[i], mode: 'off'});
      }
    }
    

  });
  Meteor.publish('people_does_not_matter', function() {
    this.session.socket.on('close', function() {console.log('closing')});
  });

  Meteor.setInterval(function() {
    var oldNames = Connections.find({'keepalive':{$lt: (new Date()).getTime() - 1500}}) // list of collections, of which have associated ids to delete
    console.log('interval');
    oldNames.forEach(function(oldPerson) {
      console.log('found oldPerson', oldPerson);
      People.update({'_id': oldPerson._id}, {$set: {mode: 'off'}});
      Connections.remove({'_id': oldPerson._id});
    });
  }, 1000);

}

var reverseCollection = function(collection) {
  var ret = [];

  collection.forEach(function(data){
    ret.push(data);
  });

  ret.reverse();
  return ret;
}
