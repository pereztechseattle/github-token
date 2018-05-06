var WHPToken = artifacts.require("./GithubToken.sol");

module.exports = function(deployer) {
  deployer.deploy(WHPToken, { value: web3.toWei(1, 'finney') });
};
