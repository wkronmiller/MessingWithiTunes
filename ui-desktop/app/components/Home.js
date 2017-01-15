// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import reactMixin from 'react-mixin';
import TimerMixin from 'react-timer-mixin';
import styles from './Home.css';
import {AjaxClient} from './AjaxClient';


class RecommenderClient extends AjaxClient {
  constructor() {
    super();
    this._root = `${this._ajaxRoot}/recommender`;
  }
  playSuggestion(continuous) {
    const url = `${this._root}/play?continuous=${continuous === true}`;
    return this._post(url, {});
  }
}

class PlayerClient extends AjaxClient {
  constructor() {
    super();
    this._root = `${this._ajaxRoot}/player`;
  }
  get playing() {
    const url = `${this._root}/playing`;
    return this._get(url).then(({song}) => song);
  }
}

export default class Home extends Component {
  constructor() {
    super();
    this.recommenderClient = new RecommenderClient();
    this.playerClient = new PlayerClient();
    this.state = {playingSong: null};
    console.log('recommender', this.recommenderClient);
    this.setInterval(this.getPlaying.bind(this), 1000);
  }
  getPlaying() {
    this.playerClient.playing.then((song) => {
      this.setState({playingSong: song});
    });
  }
  playSuggestion(event) {
    this.recommenderClient.playSuggestion()
      .then(({Name, Artist}) => this.setState({playingSong: {Name, Artist}}));
  }
  render() {
    return (
      <div>
        <div className={styles.container}>
          <h2>Shufflr</h2>
          <ul>
            <li><Link to="/library">to Library</Link></li>
            <li><a onClick={this.playSuggestion.bind(this)}>Play Suggestion</a></li>
          </ul>
        </div>
        <div className={styles.nowPlaying}>
            {this.state.playingSong ? `${this.state.playingSong.Name} by ${this.state.playingSong.Artist}` : 'not shufflin'}
        </div>
      </div>
    );
  }
}

reactMixin(Home.prototype, TimerMixin);
