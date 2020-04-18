import React, { Component } from 'react';

/**
 * This component renders a button which users can click
 */
export default class Applauder extends Component {
  constructor(props) {
    super(props);
    this.time_to_die = new Date()
    this.time_to_die.setSeconds(this.time_to_die.getSeconds() + 10)
  }

  recordApplause() {
    this.props.recordApplause();
  }

  render() {
    const message = new Date() < this.time_to_die ? <p>
      This agent is being trained using only your encouragement.
      Encourage the agent by applauding when it does well! 
    </p> : null

    return (
      <div className="applause-panel">
        { message }
        <button onClick={ () => this.recordApplause() }>
          Applaud
        </button>
      </div>
    )
  }
}