const fs = require('fs')
const plist = require('plist')

function recommendSong(sortedLibTracks) {
    const maxPlayCount = sortedLibTracks[0].PlayCount;
    console.log('max count', maxPlayCount);
    const normedCounts = sortedLibTracks
        .map(({Name, Artist, PlayCount}) => ({Name, Artist, PlayCount, P: (1 - (PlayCount / maxPlayCount))}))
        .filter(({P}) => P > Math.random())
    console.log(normedCounts[Math.floor(Math.random() * normedCounts.length)]);
}

fs.readFile('/Users/wrkronmiller/Music/iTunes/iTunes Music Library.xml', (err, data) => {
    if(err) { throw err; }
    const list = plist.parse(String(data));
    const libraryTracks = list.Playlists['0']['Playlist Items'].map((track) => track['Track ID']).map(id => list.Tracks[id]);
    const sortedLibTracks = libraryTracks
        .map((track) => ({Name: track.Name, Artist: track.Artist, PlayCount: track['Play Count'] || 0}))
        .sort((a,b) => a.PlayCount - b.PlayCount)
        .reverse();
    //fs.writeFile('/tmp/librarySongs.json', JSON.stringify(sortedLibTracks, null, 4), (err) => {if(err) throw err});
    recommendSong(sortedLibTracks);
});
