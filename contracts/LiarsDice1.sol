pragma solidity ^0.5.0;

contract LiarsDice1 {
    uint numPlayers;
    uint playerCount;
    uint numDice;
    uint nonce;
    uint countChallenge;

    enum ChallengeStatus {DEFAULT, ONE, TWO}
    ChallengeStatus status;

    struct Bid {
        address addr;
        uint value;
        uint count;
    }

    struct Player {
        string name;
        uint numDiceLeft;
        uint[] diceVals;
        bool stillPlaying;
        bool exists;
    }

    mapping (address => Bid) bids;
    mapping (uint => address) numToPlayersAddress; 
    mapping (address => Player) addressToPlayer;

    address[] bidders;
    uint[] roll;
    address currBidder;
    address prevBidder;
    // Player[] players;
    Bid currentBid;

    constructor() public {
        numPlayers = 2;
        numDice = 5;
        playerCount = 0;
        currentBid = Bid(msg.sender, 0, 0);
        status = ChallengeStatus.DEFAULT;
    }

    function _randMod() private returns(uint){
        uint rand = uint(keccak256(abi.encodePacked(
            nonce,
            now,
            block.difficulty,
            msg.sender)
        )) % 6;
        nonce ++;
        return (rand + 1);
    }

    function _getRolls(uint left) private returns(uint[] memory){
        require(left <= numDice, "Dice left greater than numDice");

        uint[] memory vals = new uint[](numDice);
        for(uint i = 0; i < left; i++){
            vals[i] = _randMod();
        }
        for(uint i=left;i<numDice;i++){
            vals[i] = 0; // 0 when dice does not exist
        }
        return vals;
    }

    function createPlayer(string memory name) public {
        require(!addressToPlayer[msg.sender].exists, "Player already exists");
        require(playerCount <= numPlayers, "Cannot create more players");

        addressToPlayer[msg.sender] = Player(name, numDice, _getRolls(numDice), true, true);
        numToPlayersAddress[playerCount] = msg.sender;
        playerCount++;
    }


    function Shuffle() public {
        require(addressToPlayer[msg.sender].exists, "Player does not exist");
        addressToPlayer[msg.sender].diceVals = _getRolls(addressToPlayer[msg.sender].numDiceLeft);
    }

    function shuffleAll() public{
        
        for(uint i = 0; i < numPlayers; i++) {
        	address adr = numToPlayersAddress[i];
        	addressToPlayer[adr].diceVals = _getRolls(addressToPlayer[adr].numDiceLeft);
        }
    }

    function placeBid(uint value, uint count) public {
        require(addressToPlayer[msg.sender].exists, "Player does not exist");
        require(currentBid.value <= value || currentBid.count <= count, "Bid must increase either value or count");
        require(!(currentBid.value == value && currentBid.count == count), "Cannot place same bid again");

        currentBid = Bid(msg.sender, value, count);
        status = ChallengeStatus.ONE;
    }

    function Challenge() public{
        // require(status != ChallengeStatus.TWO, "Already challenged");
        // require(msg.sender != currentBid.addr, "Cannot challenge your own bid");

        status = ChallengeStatus.TWO;
        uint[] memory allDiceVals = getAllDiceVals();
        for(uint i = 0; i < allDiceVals.length; i++){
            if(allDiceVals[i] == currentBid.value || allDiceVals[i] == 1){
                countChallenge ++;
            }
        }
        // set status to one after the challenge
        status = ChallengeStatus.ONE;
        if(countChallenge >= currentBid.count){
            addressToPlayer[msg.sender].numDiceLeft --;
        }
        else{
            addressToPlayer[currentBid.addr].numDiceLeft --;
        }
        // shuffleAll();
        // return (countChallenge >= currentBid.count);
    }

    function ChallengeResult() public view returns(bool){
        // true if player who challenged is winner
        return (countChallenge < currentBid.count);
    }

    function getAllDiceVals() public view returns(uint[] memory) {
        // require(status != ChallengeStatus.DEFAULT, "No bids are placed yet");
        // require(status != ChallengeStatus.ONE, "No One has challenged yet");

        uint[] memory ret = new uint[](numPlayers * numDice);
        for(uint i = 0; i < numPlayers; i++) {
            for(uint j = 0; j < numDice; j++) {
                ret[i*numDice + j] = addressToPlayer[numToPlayersAddress[i]].diceVals[j];
            }
        }
        return ret;
    }
    // function bid(uint amount, uint value) public {
    //     require((addressToPlayer[msg.sender].exists == true && addressToPlayer[msg.sender].stillPlaying == true) || addressToPlayer[msg.sender].exists == false);
    //     require(bidders.length <= numPlayers, "You Can't have more bidders than number of players");
    //     require(currentBid.amount <= amount || currentBid.value <= value, "Bid must increase either value or amount");
    //     currentBid = Bid(amount, value);
    //     if (!addressToPlayer[msg.sender].exists) {
    //         addressToPlayer[msg.sender] = Player(5, true, true);
    //     }
    //     for (uint8 i = 0; i < addressToPlayer[msg.sender].numDice; i++) {
    //         roll.push((uint(keccak256(abi.encodePacked(block.difficulty, now))) % 6) + 1);
    //     }
    //     bids[msg.sender] = currentBid;
    //     rolls[msg.sender] = roll;
    //     bidders.push(msg.sender);
    //     if (bidders.length == 1) {
    //         prevBidder = msg.sender;
    //         currBidder = msg.sender;
    //     }
    //     else {
    //         prevBidder = currBidder;
    //         currBidder = msg.sender;
    //     }
        
    //     delete roll;
    // }
    
    function getPlayer() public view returns(address, string memory, uint, bool, uint[] memory) {
        return (msg.sender, addressToPlayer[msg.sender].name, addressToPlayer[msg.sender].numDiceLeft, addressToPlayer[msg.sender].stillPlaying, addressToPlayer[msg.sender].diceVals);
    }
    
    function getBid() public view returns(address, uint, uint) {
        return (currentBid.addr, currentBid.value, currentBid.count);
    }
    
    // function getRolls() public view returns(uint[] memory) {
    //     return rolls[msg.sender];
    // }
}