import React from 'react';
import ReactDice from 'react-dice-complete';
import 'react-dice-complete/dist/react-dice-complete.css';

class Player extends React.Component {
    // constructor() {
        // state = {dice : ReactDice(numDice=2)};
    // }
    state = {
        dice : [-1, -1, -1, -1, -1],
        currentTurn : false,
        inGame : true
    };

    roll = () => {
        t = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
        ];
        this.setState({
            dice : t,
            inGame : true,
        });
    }

    render() {
        return (
            <div>
                {this.state.dice1}
                {/* {this.state.dice.numDice} */}
            </div>
        );
    }
}


export default Player;