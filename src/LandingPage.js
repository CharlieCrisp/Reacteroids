import React, { Component } from "react";

export default class LandingPage extends Component {
  startGame() {
    open("/app", "_self")
  }

  render() {
    return (
      <div className="info">
        <div className="info-text">
          <h1>Keep it Alive</h1>
          <p>
            Welcome to Keep it Alive. 
            This is a game of Asteroids with a twist!
            You cannot control your player directly. 
            It is controlled by an agent that is navigating the environment, learning how to maximise reward. <br />
            <br />
            Your job is to let it know when it's doing well and when it's doing badly, by applauding and scolding it.<br />
            <br />
            For information on this project, check it out on <a href="https://github.com/CharlieCrisp/Reacteroids" target="_blank">GitHub</a>.<br />
            <br />
          </p>
          <button onClick={this.startGame}> Start Game </button>
        </div>
      </div>
    )
  }
}