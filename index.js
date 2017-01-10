const fs = require('fs');
const plist = require('plist');
const itunescontrol = require('itunescontrol');

function recommendSong(sortedLibTracks) {
    const maxPlayCount = sortedLibTracks[0].PlayCount;
    const normedCounts = sortedLibTracks
        .map(track => {
            track.P = (1 - (track.PlayCount / maxPlayCount));
            return track;
        })
        .filter(({P}) => P > Math.random())
    const {Id, Name, Artist, RunTime}  = normedCounts[Math.floor(Math.random() * normedCounts.length)];
    console.log(`Playing ${Name} by ${Artist}`);
    itunescontrol.play(Id);
    setTimeout(() => recommendSong(sortedLibTracks), RunTime + 500);
}

fs.readFile('/Users/wrkronmiller/Music/iTunes/iTunes Music Library.xml', (err, data) => {
    if(err) { throw err; }
    const list = plist.parse(String(data));
    const libraryTracks = list.Playlists['0']['Playlist Items'].map((track) => track['Track ID']).map(id => list.Tracks[id]);
    const sortedLibTracks = libraryTracks
        .map((track) => ({
            Id: track['Track ID'], 
            Name: track.Name, 
            Artist: track.Artist,
            RunTime: track['Total Time'],
            PlayCount: track['Play Count'] || 0
        }))
        .sort((a,b) => a.PlayCount - b.PlayCount)
        .reverse();
    //fs.writeFile('/tmp/librarySongs.json', JSON.stringify(sortedLibTracks, null, 4), (err) => {if(err) throw err});
    recommendSong(sortedLibTracks);
});
