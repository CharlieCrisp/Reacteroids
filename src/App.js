import React, { Component } from "react";
import { Reacteroids } from "./Reacteroids";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./LandingPage";

export default class App extends Component {
  render() {
    return (
      <Switch>
        <Route path="/app">
          <Reacteroids />
        </Route>
        <Route path="/">
          <LandingPage />
        </Route>
      </Switch>
    )
  }
}