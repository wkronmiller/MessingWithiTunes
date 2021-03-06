'use strict'
const express = require('express');
const fs = require('fs');
const itunes = require('./itunes');

//const LISTEN_LOCATION = '/tmp/shufflr.sock';
const LISTEN_LOCATION = 8085;
const app = express();
app.set('json spaces', 2);

const state = {
    playerPromise: null,
    sortedLibTracks: null,
    trackMap: {},
    lastPlayedId: null,
};

function updateLib() {
    function updateState(sortedLibTracks) {
        state.sortedLibTracks = sortedLibTracks;
        state.trackMap = sortedLibTracks.reduce((map, track) => {
            map[track.Id] = track;
            return map;
        }, {});
    }
    return itunes.getSortedLibraryTracks().then(updateState);
}
updateLib();

const library = (() => {
    const library = express();
    library.get('/', (req, res) => {
        return res.json(state.sortedLibTracks);
    });
    library.put('/', (req, res) => {
        return updateLib().then(() => {
            res.status(200).end();
        });
    });
    library.get('/:trackId', (req, res) => {
        return res.json(state.trackMap[req.params.trackId]);
    });
    return library;
})();
app.use('/library', library);

function playSong(Id, runTime) {
    console.log('Playing', Id);
    state.playerPromise = itunes.playSong(Id, runTime)
        .then((id) => {
            console.log('Completed playing', id);
            if(state.playerPromise && state.playerPromise.song.Id === Id) {
                state.playerPromise = null;
                state.lastPlayedId = Id;
                return true;
            } 
            console.log('Song changed');
            return false;
        }).catch(console.error);
    // Is this wise? no :)
    state.playerPromise.song = state.trackMap[Id];
    return state.playerPromise;
}

const player = (() => {
    const player = express();

    player.get('/playing', (req, res) => {
        const song = (() => {
            if(state.playerPromise) {
                return state.playerPromise.song;
            }
            return null;
        })();
        return res.json({playing: state.playerPromise == true, song});
    });

    player.post('/play/:trackId', (req, res) => {
        const {Id, RunTime} = state.trackMap[req.params.trackId];
        playSong(Id, RunTime);
        return res.json({RunTime});
    });

    player.post('/stop', (req, res) => {
        return res.status(501).end();
    });
    return player;
})();
app.use('/player', player);

const recommender = (() => {
    const recommender = express();
    recommender.get('/recommend', (req, res) => {
        return res.json(itunes.recommendSong(state.sortedLibTracks));
    });
    recommender.post('/play', (req, res) => {
        console.log('Recommender playing');
        function recommendAndPlay(continuous) {
            const recommendation = itunes.recommendSong(state.sortedLibTracks);
            const {Id, RunTime} = recommendation;
            const songPromise = playSong(Id, RunTime);
            if(continuous) {
                console.log('Continuous', recommendation);
                songPromise.then((completed) => {
                    if(completed){
                        recommendAndPlay(continuous);
                    }
                });
            }
            return recommendation;
        }
        console.log('query', req.query);
        const recommendation = recommendAndPlay(req.query.continuous.toLowerCase() === 'true');
        return res.json(recommendation);
    });
    return recommender;
})();
app.use('/recommender', recommender);


// Clear socket
if(fs.existsSync(LISTEN_LOCATION)) {
    fs.unlinkSync(LISTEN_LOCATION);
}
console.log('Listening on', LISTEN_LOCATION);
app.listen(LISTEN_LOCATION);
