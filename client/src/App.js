import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReadString from './ReadString';
import SetString from './SetString';
import ReactDice from 'react-dice-complete'
import 'react-dice-complete/dist/react-dice-complete.css'

// import Player from './Player'

class Players {
  constructor() {
    this.diceState = [-1, -1, -1, -1, -1];
  }
  roll = () => {
    var t = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
    ];
    this.diceState = t;
  }
}

class App extends React.Component {
  state = { 
    loading: true, 
    drizzleState: null, 
    numPlayers: 2, 
    players: [], 
    currPlayer : 0,
    displayDice : false
  };

  diceComps = [];
  colors = [
    '#FF3333',
    '#7133FF'
  ];

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {

      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
    var player = []
    for (var i = 0; i < this.state.numPlayers; i++) {
      player.push(new Players());
      this.diceComps.push(<ReactDice numDice={5} disableIndividual={false}/>);
    }
    this.setState({players: player});


  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  roll = () => {
    var p = this.state.players;
    p[this.state.currPlayer].roll()
    this.setState({
      players: p,
      currPlayer: (this.state.currPlayer + 1) % 2,
    });
  }

  showDice = () => {
    if (this.state.displayDice == false) {
      this.setState({
        displayDice: true,
      });
    }
    else {
      this.setState({
        displayDice: false,
      });
    }
    
  }

  // displayDice = (d, i) => {
    
  // }

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    if (!this.state.displayDice) {
      return (
        <div className="App">
          <ReadString
            drizzle={this.props.drizzle}
            drizzleState={this.state.drizzleState}
          />
          <SetString 
            drizzle={this.props.drizzle}
            drizzleState={this.state.drizzleState}
          />
          {this.state.players.map((p, i) => <div key={i}>{p.diceState.toString()}</div>)}
          <button onClick={this.roll}>Click</button>
          <button onClick={this.showDice}>Show Dice</button>
          {/* {dice} */}
          {/* {dice.map(d => d.render())} */}
        </div>
      );
    }
    else {
      return(
      <div className="App">
          <ReadString
            drizzle={this.props.drizzle}
            drizzleState={this.state.drizzleState}
          />
          <SetString 
            drizzle={this.props.drizzle}
            drizzleState={this.state.drizzleState}
          />
          {this.state.players.map(p => <div>{p.diceState.toString()}</div>)}
          <button onClick={this.roll}>Click</button>
          <button onClick={this.showDice}>Show Dice</button>
          <div>
            <table>
                {this.state.players.map((p, i) => {
                  var k = [];
                  for (var j = 0; j < p.diceState.length; j++) {
                    k.push(<ReactDice key={j} numDice={1} faceColor={this.colors[i]} defaultRoll={p.diceState[j]} />);
                  }
                  return (
                    <tr>
                      {k.map(t => {
                        return (<td>{t}</td>)
                      })}
                    </tr>
                  )
                })}
            </table>
          </div>
        </div>
      );
    }
    
  }
}

export default App;
