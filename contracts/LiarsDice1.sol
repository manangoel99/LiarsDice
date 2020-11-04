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
    address winner;
    bytes32 overallHash;

    constructor() public {
        numPlayers = 3;
        numDice = 2;
        playerCount = 0;
        currentBid = Bid(msg.sender, 0, 0);
        status = ChallengeStatus.DEFAULT;
    }
    /**
        This function generates a pseudo random number
        @return     A pseudo random number
     */
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

    /**
    The given function links user addresses to the game so that their bids and rolls can be tracked
    @param name     Name of the user
     */
    function createPlayer(string memory name) public {
        require(!addressToPlayer[msg.sender].exists, "Player already exists");
        require(playerCount <= numPlayers, "Cannot create more players");

        addressToPlayer[msg.sender] = Player(name, numDice, _getRolls(numDice), true, true);
        numToPlayersAddress[playerCount] = msg.sender;
        playerCount++;
    }

    /**
    Roll the dice for every player during each round of the game
     */
    function shuffleAll(bytes32 hashVal) public{
        overallHash = hashVal;
        // for(uint i = 0; i < numPlayers; i++) {
        // 	address adr = numToPlayersAddress[i];
        // 	addressToPlayer[adr].diceVals = _getRolls(addressToPlayer[adr].numDiceLeft);
        // }
    }

    /**
    Place bids with the number of occurrences of the value on the dice by a registered member of the game.
    Also the incoming bid must raise the stakes of the currentBid.
    The bid is linked to the address of the user

    @param value    The value on the dice
    @param count    The number of occurrences of the value
     */
    function placeBid(uint value, uint count) public {
        require(addressToPlayer[msg.sender].exists, "Player does not exist");
        require(currentBid.value <= value || currentBid.count <= count, "Bid must increase either value or count");
        require(!(currentBid.value == value && currentBid.count == count), "Cannot place same bid again");

        currentBid = Bid(msg.sender, value, count);
        status = ChallengeStatus.ONE;
    }

    /**
    This function is called when a player challenges a bid of the person preceding them.
    All the dice are revealed the number of occurrences of the value counted taking 1 as a wild card.

    If the bid is correct, the challenger loses a die and if it's incorrect the bidder loses a die.
     */
    function Challenge(uint [] memory allDiceValues) public{
        // require(status != ChallengeStatus.TWO, "Already challenged");
        // require(msg.sender != currentBid.addr, "Cannot challenge your own bid");
        bytes32 _hash = keccak256(abi.encode(allDiceValues));
        require(_hash == overallHash, "Hashes dont match");
        status = ChallengeStatus.TWO;
        uint[] memory allDiceVals = allDiceValues;
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

    /**
    Getter method to find the result of the challenge
    @return     True if the bid was incorrect and False if it was correct
     */
    function ChallengeResult() public view returns(bool){
        // true if player who challenged is winner
        return (countChallenge < currentBid.count);
    }

    /**
    Getter method to fetch all the shuffled values of the dice. For each player there are 5 entries.
    The entry 0 corresponds to a deleted dice.

    @return     An array of size number of players * 5 containing value on each dice
     */
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

    /**
    Getter method to fetch details of a player
    @return address         The address of the player
    @return string          Name of the sender
    @return uint            Number of dice left
    @return bool            Whether the player is still playing
    @return uint[]          The values on each of the player's dice
     */
    function getPlayer() public view returns(address, string memory, uint, bool, uint[] memory) {
        return (msg.sender, addressToPlayer[msg.sender].name, addressToPlayer[msg.sender].numDiceLeft, addressToPlayer[msg.sender].stillPlaying, addressToPlayer[msg.sender].diceVals);
    }

    /**
    Getter method to get details of a bid

    @return address         Address of the current bidder
    @return uint            Value on the dice in the current bid
    @return count           Number of occurrences of the value
     */
    function getBid() public view returns(address, uint, uint) {
        return (currentBid.addr, currentBid.value, currentBid.count);
    }

    // function getRolls() public view returns(uint[] memory) {
    //     return rolls[msg.sender];
    // }
}
