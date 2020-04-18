import { KEY } from "./Keys";
import { sequential, layers, AdamOptimizer, meanSquaredError, tensor2d } from "@tensorflow/tfjs";

/**
 * This class can be extended to be an actor that acts based of an NN policy.
 */
export default class RandomActor {
  constructor(takeAction) {
    this.takeAction = takeAction;
    this.learner = new Learner();
    this.lastActions = null;
    this.lastState = null;
  }

  performAction(currentState, lastApplause, isTerminal) {
    const actions = [];
    for (const keyName of Object.keys(KEY)) {
      if (Math.random() < 0.1) {
        actions.push(KEY[keyName]);
        this.takeAction(KEY[keyName]);
      }
    }
    this.recordActions(currentState, actions, lastApplause, isTerminal);
  }

  recordActions(currentState, actions, lastApplause, isTerminal) {
    this.learner.recordHistory(this.lastState, this.lastActions, lastApplause, isTerminal);
    this.lastState = currentState;
    this.lastActions = actions;
  }
}

/**
 * This class can be extended to provide updates for a NN policy based on history and training.
 */
class Learner {
  constructor() {
    this.states = [];
    this.actions = [];
    this.rewards = [];
    this.isTerminal = [];

    this.nn = sequential();
    this.optimiser = new AdamOptimizer(0.0004, 0.9, 0.999);
  }

  setUpNN() {
    this.nn.add(
      layers.dense(
        {   
          inputShape: 10 * 4 + 6, 
          activation: 'sigmoid', 
          units: 32
        }
      )
    )
    this.nn.add(
      layers.dense(
        {  
          inputShape: 32, 
          activation: 'sigmoid', 
          units: 16
        }
      )
    )
    this.nn.add(
      layers.dense(
        {   
          inputShape: 16, 
          activation: 'sigmoid', 
          units: 4
        }
      )
    )
  }

  train() {
    console.log(this.states)
    const input = tensor2d(this.states)
    const output = this.nn.evaluate(input);

    const rewards = calculateFutureRewards(this.rewards, this.isTerminal) 

    const loss = meanSquaredError(output, rewards)
    this.optimiser.minimize(loss);
  }

  recordHistory(state, action, reward, isTerminal) {
    this.states.push(state);
    this.actions.push(action);
    this.rewards.push(reward);
    this.isTerminal.push(isTerminal);

    if (this.states.length > 1000) {
      console.log("Flushing history");
      console.log(this.states);
      console.log(Math.sum(this.rewards));
      this.states = [];
      this.actions = [];
      this.rewards = [];
      this.isTerminal = [];
    }
  }
}