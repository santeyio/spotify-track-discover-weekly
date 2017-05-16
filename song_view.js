var MongoClient = require('mongodb').MongoClient;
var handlebars = require('handlebars');
var assert = require('assert');
var dateFormat = require('dateformat');

var template = `
<html>
   <head>
      <title>Discover Weekly Stats</title>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
   </head>
   <body>

      <div id="detailsModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="detailsModalLabel">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
               <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
               <h4 class="modal-title" id="myModalLabel">Details</h4>
            </div>
            <div class="modal-body">
               <p>Artist <i id="artist"></i> appears <b id="artisttimes"></b> times</p><br/>
               <p>Album <i id="album"></i> appears <b id="albumtimes"></b> times</p><br/>
               <table class="table table-condensed table-striped">
                  <thead>
                     <tr>
                        <td>Song</td>
                        <td>Date</td>
                     </tr>
                  </thead>
                  <tbody id="datelist">
                  </tbody>
                  
               </table>
            </div>
          </div>
        </div>
      </div>


      <div class="container">
      <h2> Spotify Statistics </h2>
      <p style="font-size:12px">Click on headers to sort</p>
      &nbsp;<br/>
         <table id="songTable" class="table table-condensed table-striped">
            <thead>
            <tr>
               <th>Details</th>
               <th></th>
               <th>Song</th>
               <th>Artist</th>
               <th>Album</th>
               <th>Date Added</th>
            </tr>
            </thead>
            <tbody style="font-size:12px">
            {{#each songs}}
            <tr>
               <td><a href="#detailsModal" id="showModal" data-toggle="modal" data-name="{{this.name}}" data-artist="{{this.artist}}" data-album="{{this.album}}" data-date="{{this.date}}">Details</a></td>
               <td><a target="_blank" href="{{this.trackurl}}">play</a></td>
               <td>{{this.name}}</td>
               <td>{{this.artist}}</td>
               <td>{{this.album}}</td>
               <td>{{this.date}}</td>
            </tr>
            {{/each}}
            </tbody>
         </table>
      </div>
      <script>
      (function(){

         $('th').click(function(){
            var table = $(this).parents('table').eq(0);
            var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
            this.asc = !this.asc;
            if (!this.asc){rows = rows.reverse();}
            for (var i = 0; i < rows.length; i++){table.append(rows[i]);}
         })

         function comparer(index) {
            return function(a, b) {
               var valA = getCellValue(a, index), valB = getCellValue(b, index);
               return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
            }
         }

         function getCellValue(row, index){ return $(row).children('td').eq(index).html(); }

         function countValues(key_name, key_val, dataset){

            if (key_name == 'name'){
               var date_array = []
               dataset.forEach(function(song){
                  if (song[key_name] == key_val) {
                     date_array.push({
                        name: song[key_name],
                        date: song['date'],
                     });
                  }
               });
               return date_array;
            } else {
               return dataset.reduce(function(n, song){
                  return n + (song[key_name] == key_val);
               }, 0);
            }
         }

         var songs = {{{json songs}}};
         
         $('#detailsModal').on('show.bs.modal', function(event){
            var button = $(event.relatedTarget),
                modal = $(this);

            var name = button.data('name'),
                artist = button.data('artist'),
                album = button.data('album'),
                date = button.data('date');

            var date_array = countValues('name', name, songs);
            var date_html = '';
            
            date_array.forEach(function(song){
               date_html += '<tr><td>'+song.name+'</td><td>'+song.date+'</td></tr>';
            });
               
            modal.find('#artist').text(artist);
            modal.find('#artisttimes').text(countValues('artist', artist, songs));
            modal.find('#album').text(album);
            modal.find('#albumtimes').text(countValues('album', album, songs));
            modal.find('#datelist').html(date_html);
            $('#detailsModal').focus();
         })
      })();
      </script>
   </body>
</html>
`;


module.exports = function(context, req, res){

   handlebars.registerHelper('json', function(context) {
       return JSON.stringify(context);
    });

   MongoClient.connect(context.data.MONGO_URL, function(err, db){
      if (err) res.end(err);

      var songs = [];

      db
         .collection('songData')
         .find({})
         .each(function(err, song){
            if (err) return (err);

            if (song != null) {
               songs.push({
                  name: song.name,
                  artist: song.artist,
                  album: song.album,
                  date: dateFormat(song.time, "dddd, mmmm dS"),
                  trackurl: song.trackurl
               });
            } else {
               db.close();
               
               compiled_template = handlebars.compile(template);
               res.writeHead(200, { 'Content-Type': 'text/html '});
               res.end(compiled_template({songs: songs}));
            }

         });

   });

}

