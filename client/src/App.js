import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReadString from './ReadString';
import SetString from './SetString';
import ReactDice from 'react-dice-complete'
import 'react-dice-complete/dist/react-dice-complete.css'
// import M from 'materialize-css'
// import 'materialize-css/dist/css/materialize.min.css';
import {DropdownButton, Dropdown, ButtonGroup} from 'react-bootstrap';
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
    // M.AutoInit();
    let dropdowns = document.querySelectorAll('.dropdown-trigger');
    
    let options = {
        inDuration: 300,
        outDuration: 300,
        hover: true, // Activate on hover
        coverTrigger: false, // Displays dropdown below the button
    };
    
    // M.Dropdown.init(dropdowns, options);
    // document.addEventListener('DOMContentLoaded', function() {
    //   var elems = document.querySelectorAll('.dropdown-trigger');
    //   var instances = M.Dropdown.init(elems, options);
    // });
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
    console.log(this.props);
    var {drizzle} = this.props;
    var drizzleState = drizzle.store.getState();
    const contract = drizzle.contracts.LiarsDice1;

    // const dataKey = contract.methods["getAllDiceVals"].cacheCall({
    //   from: drizzleState.accounts[this.state.currPlayer],
    //   gas: 300000
    // });
    const challengeId = contract.methods['Challenge'].cacheSend({
      from : drizzleState.accounts[this.state.currPlayer],
      gas: 3000000
    });

    this.setState({
      challengeId: challengeId,
      challengeStatus: false
    });
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
    const circleStyle = {
      width:'400px',
      height:'400px',
      borderRadius:'200px',
      background: 'black',
      position:'relative',
      // left:'200px',
      // top:'100px',
      backgroundImage: `url(unnamed.jpg)`,
      backgroundSize: 'cover'
      // objectFit: 'cover',
    }
    var x0 = 197;
    var y0 = 197;
    var points = [];
    for (var i = 0; i < this.state.numPlayers; i++) {
      points.push([x0 + 200 * Math.cos(2 * Math.PI * i / this.state.numPlayers), y0 + 100 * Math.sin(2 * Math.PI * i / this.state.numPlayers)]);
    }
    // const pointStyle = {
    //   left: 
    // }
    console.log(points);
    if (!this.state.displayDice) {
      return (
        <div className="App container">
          <div className="row">
            <div className="col-sm-6">
            <div style={circleStyle}>
              {points.map((p, i) => {
                if (i == this.state.currPlayer) {
                  var pointStyle = {
                    left: p[0] + 'px',
                    top: p[1] + 'px',
                    width:'10px',
                    height:'10px',
                    background: this.colors[i],
                    borderRadius: '10px',
                    position:'absolute',
                  };
                }
                else {
                  var pointStyle = {
                    left: p[0] + 'px',
                    top: p[1] + 'px',
                    width:'10px',
                    height:'10px',
                    background: 'blue',
                    borderRadius: '10px',
                    position:'absolute',
                  };
                }  
                return <div key={i} className='point' style={pointStyle}></div>
              })}
            </div>
            </div>
            <div  className='col-sm-6'>
              <div>
                <div className='inline'><div>Current Player</div></div>
                <div className='inline'><div style={style}></div></div>
              </div>
              <div>
              <DropdownButton
                as={ButtonGroup}
                key={"Value"}
                id={`dropdown-variant-primary`}
                title={"value"}
              >
                {[1, 2, 3, 4, 5, 6].map(val => {
                  return (
                    <Dropdown.Item eventKey={val}>{val}</Dropdown.Item>
                  )
                })}
              </DropdownButton>
              <DropdownButton
                as={ButtonGroup}
                key={"Count"}
                id={`dropdown-variant-secondary`}
                title={"Count"}
              >
                {Array.from(Array(5 * this.state.numPlayers).keys()).map(count => {
                  return (
                    <Dropdown.Item eventKey={count}>{count}</Dropdown.Item>
                  )
                })}
              </DropdownButton>
              </div>
              {/* <DropdownButton id="dropdown-basic-button" title="Dropdown button"> */}
                {/* {['Value', 'Count'].map(variant => {
                  if (variant === 'Value') {
                    return (
                      <DropdownButton 
                      as={ButtonGroup} 
                      key={variant}
                      id={`dropdown-variant-primary`}
                      variant={variant.toLowerCase()}
                      title={variant}
                      >
                        {}
                      </DropdownButton>
                    )
                  }
                })} */}
                {/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
              {/* </DropdownButton> */}
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
          </div>
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
