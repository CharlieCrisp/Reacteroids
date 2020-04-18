import React, { Component } from 'react';

/**
 * This component renders a button which users can click
 */
export default class Applauder extends Component {
  constructor(props) {
    super(props);
  }

  recordApplause() {
    this.props.recordApplause();
  }

  render() {
    const message = <p>
      This agent is being trained using only your encouragement.
      Encourage the agent by applauding when it does well! 
    </p>

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