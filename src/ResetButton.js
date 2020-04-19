import React, { Component } from "react";

export default class ResetButton extends Component {
  constructor(props) {
    super(props);
    this.gameMode = props.gameMode
  }
  resetLocalStorage() {
    localStorage.removeItem("PPOActor_" + this.gameMode);
    localStorage.removeItem("GraphScores_" + this.gameMode);
    location.reload();
  }

  render() {
    return (
      <div className="reset">
        <button onClick={this.resetLocalStorage.bind(this)}>Reset History</button>
      </div>
    )
  }
}