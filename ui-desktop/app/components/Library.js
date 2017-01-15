// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import {AjaxClient} from './AjaxClient';
import styles from './Library.css';

class LibraryClient extends AjaxClient {
    constructor() {
        super();
        this._root = `${this._ajaxRoot}/library`;
    }
    getSongs() {
        return this._get(this._root)
        .then(data => data.map(({Name, Artist, Disliked, Loved, PlayCount}) =>({Name, Artist, Disliked, Loved, PlayCount})));
    }
}

const Song = ({song}) => { 
    const {Name, Artist, Disliked, Loved, PlayCount} = song;
    return (
        <li><ul>
            <li className={styles.song}>{Name}</li>
            {(() => {
                if(Loved || Disliked){
                    return (
                    <div className={styles.loveHate}>
                        {Loved ? <li className="fa fa-heart" /> : null}
                        {Disliked ? <li className="fa fa-frown-o" /> : null}
                    </div>
                    );
                }
            })()}
            <li className={styles.artist}>{Artist}</li>
            <li className={styles.playCount}>{PlayCount} plays</li>
        </ul></li>
    );
}

export default class Library extends Component {
    constructor() {
        super();
        this.state = {songs: null};
        this.libraryClient = new LibraryClient();
        this.libraryClient.getSongs().then(songs => this.setState({songs}));
    }
    mkSongs(songs) {
        return (
            <ul>{songs.map((song, index) => {
                    return <Song song={song} key={index}/>
                })}
            </ul>
        );
    }
    //<i className="fa fa-arrow-left fa-3x" />
    render() {
        return(
            <div className={styles.libBody}>
                <div className={styles.backButton}>
                  <Link to="/">
                    to Home
                  </Link>
                </div>
                <div className={styles.songList}>
                    {this.state.songs ? this.mkSongs(this.state.songs) : 'Loading'}
                </div>
            </div>
        );//TODO
    }
}
