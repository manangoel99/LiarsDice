const MyStringStore = artifacts.require("MyStringStore");
const LiarsDice = artifacts.require("LiarsDice");
const LiarsDice1 = artifacts.require("LiarsDice1");
module.exports = function(deployer) {
  deployer.deploy(MyStringStore);
  deployer.deploy(LiarsDice);
  deployer.deploy(LiarsDice1);
};