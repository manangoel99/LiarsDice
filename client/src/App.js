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
    numPlayers: 4, 
    players: [], 
    currPlayer : 0,
    displayDice : false,
    challengeStatus: true,
  };

  diceComps = [];
  colors = [
    '#FF3333',
    '#7133FF',
    '#46FF33',
    '#FF33B2'
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
    var player = [];
    for (var i = 0; i < this.state.numPlayers; i++) {
      player.push(new Players());
    }
    this.setState({players: player});
  }

  createPlayer = () => {
    const {drizzle} = this.props;
    const drizzleState = drizzle.store.getState();
    const contract = drizzle.contracts.LiarsDice1;
    for (var i = 0; i < this.state.numPlayers; i++) {
      const stackId = contract.methods["createPlayer"].cacheSend("vovo", {
        from: drizzleState.accounts[i],
        gas: 300000
      });
    }
  }


  componentWillUnmount() {
    this.unsubscribe();
  }

  roll = () => {
    var p = this.state.players;
    p[this.state.currPlayer].roll()
    this.setState({
      players: p,
      currPlayer: (this.state.currPlayer + 1) % (this.state.numPlayers),
      displayDice: false
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

  submitBid = e => {
    if (e.keyCode === 13) {
      var string = e.target.value.split(" ");
      var value = parseInt(string[0]);
      var count = parseInt(string[1]);

      const {drizzle} = this.props;
      const drizzleState = drizzle.store.getState();
      const contract = drizzle.contracts.LiarsDice1;
      var stackID = contract.methods["placeBid"].cacheSend(value, count, {
        from: drizzleState.accounts[this.state.currPlayer],
        gas: 300000
      });
      console.log(stackID);
      this.setState({
        currPlayer: (this.state.currPlayer + 1) % (this.state.numPlayers)
      })
    }
  }

  challenge = () => {
    const {drizzle} = this.props;
    const drizzleState = drizzle.store.getState();
    const contract = drizzle.contracts.LiarsDice1;

    // const dataKey = contract.methods["getAllDiceVals"].cacheCall({
    //   from: drizzleState.accounts[this.state.currPlayer],
    //   gas: 300000
    // });
    const challengeId = contract.methods['Challenge'].cacheSend({
      from : drizzleState.accounts[this.state.currPlayer],
      gas: 300000
    })
    this.setState({
      challengeId: challengeId,
      challengeStatus: false
    });
    // console.log(drizzleState.contracts.LiarsDice1.storedData[dataKey].value);
  }

  getChallengeStatus = () => {
    const {drizzle} = this.props;
    const drizzleState = drizzle.store.getState();

    // get the transaction hash using our saved `stackId`
    const txHash = drizzleState.transactionStack[this.state.challengeId];
    console.log(txHash);
    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;
    return `Challenge Status : ${drizzleState.transactions[txHash] && drizzleState.transactions[txHash].status}`
  }

  render() {
    if (this.state.loading) return "Loading Drizzle...";
    const style = {
      width: '15px',
      height: '15px',
      border: '1px',
      backgroundColor: this.colors[this.state.currPlayer]
    }
    if (!this.state.displayDice) {
      return (
        <div className="App">
          <div>
            <div className='inline'><div>Current Player</div></div>
            <div className='inline'><div style={style}></div></div>
          </div>
          {/* <div>Current Player : <div style={style}></div></div> */}
          {this.state.players.map((p, i) => <div key={i}>{p.diceState.toString()}</div>)}
          <button onClick={this.roll}>Click</button>
          <button onClick={this.showDice}>Show Dice</button>
          <button onClick={this.createPlayer}>Create Players</button>
          <div>
            <input type="text" onKeyDown={this.submitBid}/>
          </div>
          <button onClick={this.challenge}>Challenge</button>
          <div>{this.getChallengeStatus()}</div>
        </div>
      );
    }
    else {
      return(
      <div className="App">
          <div>
            <div className='inline'><div>Current Player</div></div>
            <div className='inline'><div style={style}></div></div>
          </div>
          {this.state.players.map((p, i) => <div key={i}>{p.diceState.toString()}</div>)}
          <button onClick={this.roll}>Click</button>
          <button onClick={this.showDice}>Show Dice</button>
          <div>
            <table>
              <tbody>
                {this.state.players.map((p, i) => {
                  var k = [];
                  for (var j = 0; j < p.diceState.length; j++) {
                    k.push(<ReactDice 
                        key={j} 
                        numDice={1} 
                        faceColor={this.colors[i]} 
                        defaultRoll={p.diceState[j]}
                        disableIndividual={true}
                        dotColor={'#000000'}
                      />);
                  }
                  return (
                    <tr key={i}>
                      {k.map((t, idx) => {
                        return (<td key={idx}>{t}</td>)
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
  }
}

export default App;
