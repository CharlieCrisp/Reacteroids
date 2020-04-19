import React, { Component } from "react";

export default class Graph {
  constructor(x, y, graphStateTag) {
    this.graphHeight = 200;
    this.graphWidth = 300;
    this.bottomLeft = {
      x: x,
      y: y
    }
    this.topLeft = {
      x: x,
      y: y + this.graphHeight
    }
    this.bottomRight = {
      x: x + this.graphWidth,
      y: y
    }
    this.graphStateTag = "GraphScores_" + graphStateTag;
    this.scores = this.getInitialScores();
  }

  getInitialScores() {
    const savedScores = localStorage.getItem(this.graphStateTag);
    if (savedScores != null) {
      return JSON.parse(savedScores);
    } else {
      return [0];
    }
  }

  addScore(score) {
    this.scores.push(score);
    this.saveState();
  }

  drawLine(state, from, to) {
    const context = state.context;
    context.save();
    context.strokeStyle = '#fff';
    context.lineWidth = 2;

    const height =  state.screen.height;
    context.beginPath();
    context.moveTo(from.x, height - to.y);
    context.lineTo(to.x, height - from.y);
    context.stroke();
    context.closePath();

    context.restore();
  }

  drawScores(state) {
    const max = Math.max.apply(null, this.scores);
    const yMax = max * 1.5;

    const height =  state.screen.height;
    const context = state.context;

    context.save();
    context.strokeStyle = '#fff';
    context.lineWidth = 2;

    context.moveTo(this.bottomLeft.x, 0);
    context.beginPath();

    for (var i = 0; i < this.scores.length; i++) {
      const y = (this.scores[i] / yMax) * this.graphHeight + this.bottomLeft.y;
      const x = (i / (this.scores.length - 1)) * this.graphWidth + this.bottomLeft.x;
      context.lineTo(x, height - y);
    } 

    context.stroke();
    context.closePath();

    context.restore();
  }

  render(state) {
    // Draw
    this.drawLine(state, this.bottomLeft, this.topLeft);
    this.drawLine(state, this.bottomLeft, this.bottomRight);

    this.drawScores(state)
  }

  saveState() {
    localStorage.setItem(this.graphStateTag, JSON.stringify(this.scores));
  }
}

export class GraphLabels extends Component {
  render() {
    return (
      <div>
        <div className="xaxis">Time</div>
        <div className="yaxis">Score</div>
      </div>
    )
  }
}