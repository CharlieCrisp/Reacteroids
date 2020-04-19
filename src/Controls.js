import React, { Component } from 'react';
import { GAME_REWARD_MODE } from './GameRewardMode';

/**
 * This component renders a button which users can click
 */
export default class Controls extends Component {
  constructor(props) {
    super(props);
    this.gameMode = props.gameMode;
  }

  recordApplause() {
    this.props.incrementScore(+1);
  }

  scoldAgent() {
    this.props.incrementScore(-1);
  }


  render() {
    if (this.gameMode == GAME_REWARD_MODE.APPLAUSE) {
      return (
        <div className="applause-panel">
          <button onClick={ () => this.recordApplause() }>
            Applaud<br />
            (ENTER)
          </button>

          <button onClick={ () => this.scoldAgent() }>
            Scold<br />
            (SPACE)
          </button>
        </div>
      )
    } else {
      return null;
    }
  }
}