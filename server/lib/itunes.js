const fs = require('fs');
const plist = require('plist');
const itunescontrol = require('itunescontrol');

function recommendSong(sortedLibTracks) {
    console.log('Recommending songs');
    const maxPlayCount = sortedLibTracks[0].PlayCount;
    const normedCounts = sortedLibTracks
        .map(track => {
            track.P = (1 - (track.PlayCount / maxPlayCount));
            return track;
        })
        .filter(({P}) => P > Math.random());
    const {Id, Name, Artist, RunTime}  = normedCounts[Math.floor(Math.random() * normedCounts.length)];
    return {Id, Name, Artist, RunTime};
}

function playSong(Id, runTime) {
    const SONG_LENGTH_MARGIN_MS = 500;
    return new Promise((resolve) => {
        itunescontrol.play(Id);
        setTimeout(() => resolve(Id), runTime + SONG_LENGTH_MARGIN_MS);
    });
}

function getTotalPlayTime(sortedLibTracks) {
    const msInHr = 1000 * 60 * 60;
    const totalHrs = sortedLibTracks
        .map(({PlayCount, RunTime}) => (PlayCount * RunTime) / msInHr)
        .filter(normedCount => isNaN(normedCount) === false)
        .reduce((sum, normedCount) => sum + normedCount);
    return totalHrs;
}

/**
 * Return tracks from library, sorted by play count
 */
function getSortedLibraryTracks() {
    return new Promise((resolve) => {
            fs.readFile(`${process.env.HOME}/Music/iTunes/iTunes Music Library.xml`, (err, data) => {
            if(err) { throw err; }
            const list = plist.parse(String(data));
            const libraryTracks = list.Playlists['0']['Playlist Items'].map((track) => track['Track ID']).map(id => list.Tracks[id]);
            const sortedLibTracks = libraryTracks
                .map((track) => ({
                    Id: track['Track ID'], 
                    Name: track.Name, 
                    Artist: track.Artist,
                    RunTime: track['Total Time'],
                    PlayCount: track['Play Count'] || 0,
                    Disliked: track.Disliked || false,
                    Loved: track.Loved || false,
                }))
                .sort((a,b) => a.PlayCount - b.PlayCount)
                .reverse();
            //fs.writeFile('/tmp/librarySongs.json', JSON.stringify(sortedLibTracks, null, 4), (err) => {if(err) throw err});
            return resolve(sortedLibTracks);
        });
    });
}

module.exports = {recommendSong, playSong, getSortedLibraryTracks};
