var WHPToken = artifacts.require("./GithubToken.sol");

module.exports = function(deployer) {
  deployer.deploy(WHPToken);
};
