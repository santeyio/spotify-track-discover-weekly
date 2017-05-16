# What is this?

I found this cool service called [webtask](https://webtask.io/) recently and wanted to give it a shot, so I wrote this little app using IFTTT and webtasks to keep a history of my spotify discover weekly playlist. You can check out the final result here: https://wt-05a6b8d8991ec3e5cb5fc790589e7497-0.run.webtask.io/song_view

Parenthetically, I used handlebars and bootstrap for the templating in the song_view.js.

# How To Set Up Your Own

First install the CLI as explained on their [website](https://webtask.io/docs/101).

Then create a new webtask with the save_song.js. Note that you'll have to connect to a mongo database, so you'll need to have access to some database. I have one running on my server, so I just used that mongo. Webtask makes it so that you don't have to include the DB creds hardcoded into your webtask (great for security reasons). You just create a 'secret' when you create the webtask and it passes it into your javascript as the variable (in this case as MONGO_URL which you can see in the save_song.js):

`wt create --secret MONGO_URL=mongodb://user:pwd@somedomain.com/databaseName?authSource=databaseName save_song.js`

The only other thing you have to do is set up an [IFTTT](https://ifttt.com/discover).

Create a new app in your IFTTT account with an 'if' of your spotify discover weekly playlist being updated and a 'then' of a Maker Webhooks. It took me a while to figure this out, but you can specify parameters in the URL textbox. I send the data as URL parameters, GET HTTP method, and application/json content type header. Here's what I have in my URL text box

`https://yourwebtaskurl?TrackName=<<<{{TrackName}}>>>&ArtistName=<<<{{ArtistName}}>>>&AlbumName=<<<{{AlbumName}}>>>&PlaylistName=<<<{{PlaylistName}}>>>&AddedAt=<<<{{AddedAt}}>>>&TrackURL=<<<{{TrackURL}}>>>`

Now you just need to set up your view webtask:

`wt create --secret MONGO_URL=mongodb://user:pwd@somedomain.com/databaseName?authSource=databaseName song_view.js`

And now you have your very own Discover Weekly archive!
