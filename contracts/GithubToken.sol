pragma solidity ^0.4.18;

import "./lifecycle/Pausable.sol";
import "./lifecycle/Destructible.sol";
import "./math/SafeMath.sol";

import "./solidity-stringutils/strings.sol";

/**
 * @author billyp
 */
contract GithubToken is Pausable, Destructible {

  using strings for *;

  using SafeMath for uint256;

  uint public _totalStars;

  mapping (bytes => uint) scoreInverseByProjectUrl;

  mapping (bytes => mapping (address => uint)) sharesByOwnerByProjectUrl;

  // value of each project's share in wei
  mapping (bytes => uint) shareValueByProjectUrl;

  event LogOraclizeQuery(string _result);

  event LogCallback(string _result);

  function addProject(bytes url, uint numStars) public payable returns (bool) {
      _totalStars = _totalStars.add(numStars);

      assert(_totalStars >= numStars);

      // avoid floating point by using the inverse
      scoreInverseByProjectUrl[url] = _totalStars.div(numStars);

      sharesByOwnerByProjectUrl[url][msg.sender] = _computeInitialShares(url);
  }

  function _computeInitialShares(bytes url) internal returns (uint) {
      uint balance = address(this).balance;

      assert (scoreInverseByProjectUrl[url] > 0);

      return balance.div(scoreInverseByProjectUrl[url]);
  }
}