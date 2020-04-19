import React, { Component } from "react";

export default class ResetButton extends Component {
  resetLocalStorage() {
    localStorage.removeItem("PPOActor_UserTrainedActor");
    localStorage.removeItem("GraphScores_UserTrainedActor");
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