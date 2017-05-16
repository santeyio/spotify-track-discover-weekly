var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

function save_song(song, db, cb){
   db
      .collection('songData')
      .insertOne(
         {
            name: song.name,
            artist: song.artist,
            album: song.album,
            playlist: song.playlist,
            time: Date(),
            trackurl: song.trackurl
         },

         function(err, r){
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
            db.close();
            console.log('saved song successfully');
         }
   );
}

module.exports = function(context, done){
   
   var song = {
      name: context.data.TrackName,
      artist: context.data.ArtistName,
      album: context.data.AlbumName,
      playlist: context.data.PlaylistName,
      time: Date(),
      trackurl: context.data.TrackURL
   }

   MongoClient.connect(context.data.MONGO_URL, function(err, db){

      if(err) return done(err);

      save_song(song, db, function(err){
         if(err) return done(err);
      });

   });

   done(null, 'Success.');
}
