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
    const message = <p>
      This agent is being trained using only your encouragement.
      Encourage the agent by applauding it when it does well and scolding it when it's doing badly.
    </p>

    return (
      <div className="applause-panel">
        { message }
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