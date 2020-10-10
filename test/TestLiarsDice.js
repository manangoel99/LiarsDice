const LiarsDice1 = artifacts.require("./LiarsDice1.sol");

contract("LiarsDice1", accounts => {
    it("HOH", async () => {
        const contract = await LiarsDice1.deployed();
        let player1 = accounts[0];
        let player2 = accounts[1];
        
        for (var i = 0; i < 2; i++) {
            await contract.createPlayer.sendTransaction("vovo", {
                from: accounts[i],
                gas: 300000,
            });
            // const stackId = contract.methods["createPlayer"].cacheSend("vovo", {
            //   from: accounts[i],
            //   gas: 300000
            // });
        }

        await contract.placeBid.sendTransaction(1, 2, {
            from: accounts[0],
            gas: 300000,
        });

        await contract.placeBid.sendTransaction(3, 4, {
            from: accounts[1],
            gas: 300000,
        });

        await contract.Challenge.sendTransaction({
            from: accounts[0],
            gas: 300000,
        })

        let x = await contract.getAllDiceVals.call();
        assert.equal(x, 0, "HAHA");

        // await conctract.bid.sendTransaction(4, 5, {from : player1, gas:3000000});
        // await conctract.bid.sendTransaction(5, 6, {from : player2, gas:3000000});

        // let bidders = await conctract.getBidders.call();
        // assert.equal(bidders.length, 2, "Not same number of buyers");
        // assert.equal(bidders[0].valueOf(), player1, "AA");
        // assert.equal(bidders[1].valueOf(), player2, "AA");
    });
});