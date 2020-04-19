import { 
  randomNormal, 
  variable, 
  AdamOptimizer, 
  tensor2d,
  tensor1d,
  tensor, 
  multinomial, 
  expandDims,
  clipByValue
} from "@tensorflow/tfjs";


const epsilon = 0.2;
const numEpochs = 50;
const gamma = 0.97;
const adamLR = 0.001;
const beta1 = 0.9;
const beta2 = 0.999;
const entropyLossFactor = 0.05;

function calculateFutureRewards(rewards, isTerminals) {
  var discounted_reward = 0;
  const discounted_rewards = [];
  for (var i = rewards.length - 1; i >= 0; i--) {
    const reward = rewards[i];
    const isTerminal = isTerminals[i];
    discounted_reward = isTerminal ? reward : reward + discounted_reward * gamma
    discounted_rewards.push(discounted_reward)
  }

  return tensor(discounted_rewards).reverse();
}

function surrogate(model, input, startingLogProbs, rewards) {
  //TODO add baseline critic
  const logProbs = model(input);
  const ratios = logProbs.sub(startingLogProbs).exp();

  const probs = logProbs.exp()
  const oneMinusProbs = logProbs.neg().add(1)
  const firstTerm = probs.mul(probs.log(2))
  const secondTerm = oneMinusProbs.mul(oneMinusProbs.log(2))
  const entropy = firstTerm.neg().sub(secondTerm)

  const clippedSurr = clipByValue(ratios, 1 - epsilon, 1 + epsilon).mul(rewards).sum().neg().asScalar()

  return clippedSurr.sub(entropy.sum().mul(entropyLossFactor).asScalar());
}

export default class PPOActor {
  constructor(takeAction, gameModelTag) {
    this.takeAction = takeAction;
    this.memory = new Memory();
    this.lastActions = null;
    this.lastState = null;
    this.gameModelTag = "PPOActor_" + gameModelTag;
    this.optimiser = new AdamOptimizer(adamLR, beta1, beta2);
    this.setUpNN();
  }

  setUpNN() {
    const savedModel = localStorage.getItem(this.gameModelTag);
    if (savedModel != null) {
      const model = JSON.parse(savedModel)
      this.w1 = variable(tensor2d(model.w1, [10 * 4 + 6, 32]));
      this.b1 = variable(tensor1d(model.b1));
      this.w2 = variable(tensor2d(model.w2, [32, 4]));
      this.b2 = variable(tensor1d(model.b2));
      console.log("Loaded saved model from localstorage");
    } else {
      this.w1 = variable(randomNormal([10 * 4 + 6, 32]));
      this.b1 = variable(randomNormal([32]));
      this.w2 = variable(randomNormal([32, 4]));
      this.b2 = variable(randomNormal([4]));
    }
  }

  model(x, train) {
    const outputTf = x.matMul(this.w1).add(this.b1).tanh().matMul(this.w2).add(this.b2).sigmoid();
    const probsData = outputTf.log().sum(1);
    if (train) {
      return probsData;
    }
    

    const [pLeft, pRight, pUp, pSpace] = outputTf.dataSync();
    const bernoulliLeft = multinomial([pLeft, 1 - pLeft], 1);
    const bernoulliRight = multinomial([pRight, 1 - pRight], 1);
    const bernoulliUp = multinomial([pUp, 1 - pUp], 1);
    const bernoulliSpace = multinomial([pSpace, 1 - pSpace], 1);
    return [
      [bernoulliLeft.dataSync()[0], bernoulliRight.dataSync()[0], bernoulliUp.dataSync()[0], bernoulliSpace.dataSync()[0]],
      probsData
    ];
  }
  
  train() {
    console.log("Updating model weights based on recent trajectories.")
    for (var i = 0; i < numEpochs; i++) {
      this.optimiser.minimize(() => {
        const input = tensor2d(this.memory.states);
        const startingLogProbs = tensor1d(this.memory.logProbs);
        const rewards = calculateFutureRewards(this.memory.rewards, this.memory.isTerminal) ;

        const surr = surrogate(input => this.model(input, true), input, startingLogProbs, rewards);
        return surr;
      })
    }
    this.saveState()
  }
  

  performAction(currentState, lastApplause, isTerminal) {
    const [actions, logProbs] = this.model(expandDims(tensor(currentState)));
    const [left, right, up, space] = actions
    this.recordActions(currentState, actions, logProbs, lastApplause, isTerminal);

    if (isTerminal && this.memory.length() > 100) {
      this.train();
      this.memory.clearHistory();
    }
    this.takeAction({
      left: left == 1, 
      right: right == 1, 
      up: up == 1,
      space: space == 1
    })
  }

  recordActions(currentState, actions, logProbs, lastApplause, isTerminal) {
    if (this.lastState != null) {
      this.memory.recordHistory(this.lastState, this.lastActions, logProbs, lastApplause, isTerminal);
    }
    this.lastState = currentState;
    this.lastActions = actions;
  }

  saveState() {
    const gameModelWeights = {
      b1: this.b1.arraySync(),
      b2: this.b2.arraySync(),
      w1: this.w1.flatten().arraySync(),
      w2: this.w2.flatten().arraySync()
    }

    localStorage.setItem(this.gameModelTag, JSON.stringify(gameModelWeights));
  }
}

class Memory {
  constructor() {
    this.states = [];
    this.actions = [];
    this.logProbs = [];
    this.rewards = [];
    this.isTerminal = [];
  }


  /**
   * This function discounts
   */
  removeLastTrajectoryIfThereWereNoRewards() {
    // Check terminal state of last trajectory.
    if (this.rewards[this.length() - 1] != 0) {
      return;
    }

    for (var i = this.length() - 2; i >= 0; i--) {
      const reward = this.rewards[i];
      const isTerminal = this.isTerminal[i];
      if (reward != 0) {
        // No need to clear trajectory, we've registered a reward
        return;
      }
      if (isTerminal) {
        // We've seen no rewards and we've reached the next trajectory
        this.states = this.states.slice(0, i + 1);
        this.actions = this.actions.slice(0, i + 1);
        this.logProbs = this.logProbs.slice(0, i + 1);
        this.rewards = this.rewards.slice(0, i + 1);
        this.isTerminal = this.isTerminal.slice(0, i + 1);
        return;
      }
    }
  }

  recordHistory(state, action, logProb, reward, isTerminal) {
    this.states.push(state);
    this.actions.push(action);
    this.logProbs.push(logProb);
    this.rewards.push(reward);
    this.isTerminal.push(isTerminal);

    if (isTerminal) {
      removeLastTrajectoryIfThereWereNoRewards();
    }
  }

  clearHistory() {
    this.states = [];
    this.actions = [];
    this.logProbs = [];
    this.rewards = [];
    this.isTerminal = [];
  }

  length() {
    return this.states.length;
  }
}
