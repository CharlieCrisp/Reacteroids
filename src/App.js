import React, { Component } from "react";
import { Reacteroids } from "./Reacteroids";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import { GAME_REWARD_MODE } from "./GameRewardMode";

export default class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/app">
          <Reacteroids gameMode={GAME_REWARD_MODE.APPLAUSE} />
        </Route>
        <Route path="/train">
          <Reacteroids gameMode={GAME_REWARD_MODE.SCORE} />
        </Route>
        <Route path="/">
          <LandingPage />
        </Route>
      </Switch>
    )
  }
}