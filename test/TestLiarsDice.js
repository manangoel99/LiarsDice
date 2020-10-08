const LiarsDice = artifacts.require("./LiarsDice.sol");

contract("LiarsDice", accounts => {
    it("HOH", async () => {
        const conctract = await LiarsDice.deployed();
        let player1 = accounts[0];
        let player2 = accounts[1];

        await conctract.bid.sendTransaction(4, 5, {from : player1, gas:3000000});
        await conctract.bid.sendTransaction(5, 6, {from : player2, gas:3000000});

        let bidders = await conctract.getBidders.call();
        assert.equal(bidders.length, 2, "Not same number of buyers");
        assert.equal(bidders[0].valueOf(), player1, "AA");
        assert.equal(bidders[1].valueOf(), player2, "AA");
    });
});