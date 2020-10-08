pragma solidity ^0.5.0;

contract LiarsDice {
    uint numPlayers;
    struct Bid {
        uint amount;
        uint value;
    }

    struct Player {
        uint numDice;
        bool stillPlaying;
        bool exists;
    }

    mapping (address => Bid) bids;
    mapping (address => uint[]) rolls;
    mapping (address => Player) addressToPlayer;

    address[] bidders;
    uint[] roll;
    address currBidder;
    address prevBidder;
    // Player[] players;
    Bid currentBid;
    constructor() public {
        numPlayers = 2;
        currentBid = Bid(0, 0);
    }

    function bid(uint amount, uint value) public {
        require((addressToPlayer[msg.sender].exists == true && addressToPlayer[msg.sender].stillPlaying == true) || addressToPlayer[msg.sender].exists == false);
        require(bidders.length <= numPlayers, "You Can't have more bidders than number of players");
        require(currentBid.amount <= amount || currentBid.value <= value, "Bid must increase either value or amount");
        currentBid = Bid(amount, value);
        if (!addressToPlayer[msg.sender].exists) {
            addressToPlayer[msg.sender] = Player(5, true, true);
        }
        for (uint8 i = 0; i < addressToPlayer[msg.sender].numDice; i++) {
            roll.push((uint(keccak256(abi.encodePacked(block.difficulty, now))) % 6) + 1);
        }
        bids[msg.sender] = currentBid;
        rolls[msg.sender] = roll;
        bidders.push(msg.sender);
        if (bidders.length == 1) {
            prevBidder = msg.sender;
            currBidder = msg.sender;
        }
        else {
            prevBidder = currBidder;
            currBidder = msg.sender;
        }
        
        delete roll;
    }
    
    function getPlayer() public view returns(address, uint, bool) {
        return (msg.sender, addressToPlayer[msg.sender].numDice, addressToPlayer[msg.sender].stillPlaying);
    }
    
    function getBidders() public view returns(address[] memory) {
        return bidders;
    }
    
    function getRolls() public view returns(uint[] memory) {
        return rolls[msg.sender];
    }
}