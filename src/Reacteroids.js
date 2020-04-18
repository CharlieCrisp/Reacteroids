import React, { Component } from 'react';
import Ship from './Ship';
import Asteroid from './Asteroid';
import Applauder from './Applauder';
import { randomNumBetweenExcluding } from './helpers';
import RandomActor from "./RandomActor";
import { minBy } from "./MinBy";

const shipPadding = [-1, -1, -1, -1, -1, -1];
const asteroidPadding = [-1, -1, -1, -1];
const nNearestAsteroids = 10;

export class Reacteroids extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys : {
        left  : 0,
        right : 0,
        up    : 0,
        down  : 0,
        space : 0,
      },
      asteroidCount: 3,
      currentScore: 0,
      topScore: localStorage['topscore'] || 0,
      inGame: false
    }
    this.ship = [];
    this.asteroids = [];
    this.bullets = [];
    this.particles = [];
    this.randomActor = new RandomActor((action) => { this.takeAction(action) })
    this.timestep = 0;
    this.applause = 0;
    this.lastTimestepWasTerminal = false;
  }

  incrementScore(increment) {
    this.applause += increment;
  }

  handleResize(value, e){
    this.setState({
      screen : {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  takeAction(actions) {
    this.setState({
      keys: actions
    })
  }

  resetRandomActorActions() {
    const keys = {
      left: false,
      right: false,
      up: false,
      space: false
    }
    this.setState({
      keys: keys
    })
  }

  componentDidMount() {
    window.addEventListener('resize',  this.handleResize.bind(this, false));

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  update() {
    const context = this.state.context;
    const keys = this.state.keys;
    const ship = this.ship[0];

    
    this.timestep += 1
    if (this.timestep % 3 == 0)  {
        if (this.state.inGame || !this.lastTimestepWasTerminal) {
          const isTerminal = !this.state.inGame;
          const lastReward = this.applause;
          const currentState = this.getState();
          this.randomActor.performAction(currentState, lastReward, isTerminal);

          this.applause = 0;

          this.lastTimestepWasTerminal = isTerminal
      }
    }

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = '#000';
    context.globalAlpha = 0.4;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    // Next set of asteroids
    if(!this.asteroids.length){
      let count = this.state.asteroidCount + 1;
      this.setState({ asteroidCount: count });
      this.generateAsteroids(count)
    }

    // Check for colisions
    this.checkCollisionsWith(this.bullets, this.asteroids);
    this.checkCollisionsWith(this.ship, this.asteroids);

    // Remove or render
    this.updateObjects(this.particles, 'particles')
    this.updateObjects(this.asteroids, 'asteroids')
    this.updateObjects(this.bullets, 'bullets')
    this.updateObjects(this.ship, 'ship')

    context.restore();

    // Next frame
    requestAnimationFrame(() => {this.update()});
  }

  addScore(points){
    if(this.state.inGame){
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame(){
    this.setState({
      inGame: true,
      currentScore: 0,
    });

    // Make ship
    let ship = new Ship({
      position: {
        x: this.state.screen.width/2,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this)
    });
    this.createObject(ship, 'ship');

    // Make asteroids
    this.asteroids = [];
    this.generateAsteroids(this.state.asteroidCount)
  }

  gameOver(){
    this.setState({
      inGame: false,
    });

    // Replace top score
    if(this.state.currentScore > this.state.topScore){
      this.setState({
        topScore: this.state.currentScore,
      });
      localStorage['topscore'] = this.state.currentScore;
    }
  }

  generateAsteroids(howMany){
    let asteroids = [];
    let ship = this.ship[0];
    for (let i = 0; i < howMany; i++) {
      let asteroid = new Asteroid({
        size: 80,
        position: {
          x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x-60, ship.position.x+60),
          y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y-60, ship.position.y+60)
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      });
      this.createObject(asteroid, 'asteroids');
    }
  }

  distanceTo(firstThing, secondThing) {
    const xDif = firstThing.x - secondThing.x;
    const yDif = firstThing.y - secondThing.y;
    return Math.pow(xDif, 2) + Math.pow(yDif, 2);
  }

  getState() {
    const ship = this.ship[0];

    let shipState;
    if (ship) {
      shipState = [ship.position.x,ship.position.y, ship.velocity.x, ship.velocity.y, ship.rotation, ship.rotationSpeed];
    } else {
      shipState = shipPadding;
    }

    const asteroids = minBy(this.asteroids, nNearestAsteroids, (asteroid) => {this.distanceTo(asteroid.position, ship.position)});
    var asteroidState = asteroids.flatMap(asteroid => [asteroid.position.x, asteroid.position.y, asteroid.velocity.x, asteroid.velocity.y]);

    const nPaddedAsteroidsRequired = nNearestAsteroids - asteroids.length
    for (var i = 0; i < nPaddedAsteroidsRequired; i++) {
      asteroidState = asteroidState.concat(asteroidPadding);
    }
    return shipState.concat(asteroidState);
  }

  createObject(item, group){
    this[group].push(item);
  }

  updateObjects(items, group){
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      }else{
        items[index].render(this.state);
      }
      index++;
    }
  }

  checkCollisionsWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for(a; a > -1; --a){
      b = items2.length - 1;
      for(b; b > -1; --b){
        var item1 = items1[a];
        var item2 = items2[b];
        if(this.checkCollision(item1, item2)){
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2){
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy);
    if(length < obj1.radius + obj2.radius){
      return true;
    }
    return false;
  }

  render() {
    let endgame;
    let message;

    if (this.state.currentScore <= 0) {
      message = '0 points.';
    } else if (this.state.currentScore >= this.state.topScore){
      message = 'The agent got its best ever score with ' + this.state.currentScore + ' points.';
    } else {
      message = this.state.currentScore + ' Points'
    }

    if(!this.state.inGame){
      endgame = (
        <div className="endgame">
          <p>Your agent died! Restarting game to keep training it.</p>
          <p>{message}</p>
          <button
            onClick={ this.startGame.bind(this) }>
            try again?
          </button>
        </div>
      )
    }

    return (
      <div>
        { endgame }
        <span className="score current-score" >Score: {this.state.currentScore}</span>
        <span className="score top-score" >Top Score: {this.state.topScore}</span>
        <span className="controls" >
          This agent is learning to navigate the environment.
          Your job is to keep it alive by letting it know when it's doing well, and when it's doing badly. <br />
          Applaud = ENTER <br />
          Scold = SPACE <br />
        </span>
        <canvas ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
        <Applauder incrementScore={ (increment) => this.incrementScore(increment) }/> 
      </div>
    );
  }
}