import React, { Component } from "react";

export default class LandingPage extends Component {
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
          <button onClick={() => open("/app", "_self")}> Start Game </button>
          <br />
          <br />
          <p>
            Alternatively, you can see how the agent fairs when it is training based on solely the score. 
            The agent learns to play using the <a href="https://openai.com/blog/openai-baselines-ppo/" target="_blank">Proximal Policy Optimisation</a> Algorithm.
          </p>
          <button onClick={() => open("/train", "_self")}> See agent train for itself </button>
        </div>
      </div>
    )
  }
}