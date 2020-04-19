import React, { Component } from 'react';

/**
 * This component renders a button which users can click
 */
export default class Applauder extends Component {
  constructor(props) {
    super(props);
  }

  recordApplause() {
    this.props.incrementScore(+1);
  }

  scoldAgent() {
    this.props.incrementScore(-1);
  }


  render() {
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
  }
}