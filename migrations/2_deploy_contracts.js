const MyStringStore = artifacts.require("MyStringStore");
const LiarsDice = artifacts.require("LiarsDice");
module.exports = function(deployer) {
  deployer.deploy(MyStringStore);
  deployer.deploy(LiarsDice);
};