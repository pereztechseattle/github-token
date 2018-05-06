pragma solidity ^0.4.18;

import "./lifecycle/Pausable.sol";
import "./lifecycle/Destructible.sol";
import "./math/SafeMath.sol";

import "./solidity-stringutils/strings.sol";

/**
 * @author billyp
 */
contract GithubToken is Pausable, Destructible {

  using SafeMath for uint256;

  string[] public projects;

  // sum of all numStarsByProjectUrl values  
  uint public totalStars;

  // num stars for each project
  mapping (string => uint) numStarsByProjectUrl;

  // total num shares for each project
  mapping (string => uint) numSharesByProjectUrl;  

  // value of each project's share in wei
  mapping (string => uint) shareValueByProjectUrl;

  // total value of all shares for each project in wei
  mapping (string => uint) totalValueByProjectUrl;

  mapping (string => mapping (address => uint)) sharesByOwnerByProjectUrl;

  function GithubToken() public payable {
      addProject('github.com/github-token', 1);
  }

  function sell(string _url, uint _numShares) public returns (bool) {
    require (_numShares <= sharesByOwnerByProjectUrl[_url][msg.sender]);
    
    sharesByOwnerByProjectUrl[_url][msg.sender] = sharesByOwnerByProjectUrl[_url][msg.sender].sub(_numShares);

    numSharesByProjectUrl[_url] = numSharesByProjectUrl[_url].sub(_numShares);
    
    uint value = _computeValueForShares(numStarsByProjectUrl[_url], _numShares);

    totalValueByProjectUrl[_url] = totalValueByProjectUrl[_url].sub(value);
    
    // recompute share value
    shareValueByProjectUrl[_url] = totalValueByProjectUrl[_url].div(numSharesByProjectUrl[_url]);

    return msg.sender.send(value);
  }

  function buy(string _url) public payable returns (bool) { 

    uint nshares = _computeNumShares(numStarsByProjectUrl[_url], msg.value);
    assert(nshares > 0);

    numSharesByProjectUrl[_url] = numSharesByProjectUrl[_url].add(nshares);
    
    totalValueByProjectUrl[_url] = totalValueByProjectUrl[_url].add(msg.value);
    
    sharesByOwnerByProjectUrl[_url][msg.sender] = nshares;

    shareValueByProjectUrl[_url] = totalValueByProjectUrl[_url].div(numSharesByProjectUrl[_url]);

    return true;
  }
  
  function updateProject(string _url, uint _numStars) public returns (bool) {
      totalStars = totalStars.sub(numStarsByProjectUrl[_url]).add(_numStars);
      assert(totalStars >= _numStars);

      numStarsByProjectUrl[_url] = _numStars;

      return true;
  }

  function addProject(string _url, uint _numStars) public payable returns (bool) {
      totalStars = totalStars.add(_numStars);
      assert(totalStars >= _numStars);

      numStarsByProjectUrl[_url] = _numStars;

      return buy(_url);
  }

  // @dev assumes _numStars already included in total
  function _computeNumShares(uint _numStars, uint _value) view internal returns (uint) {
    return (_value * (totalStars.mul(1000) / _numStars)).div(10 ** 15); 
  }

  function _computeValueForShares(uint _numStars, uint _numShares) view internal returns (uint) {
    return (_numShares / (totalStars.mul(1000) / _numStars)).div(10 ** 15); 
  }

  function getBalance() view public returns (uint) {
    return address(this).balance;
  }
  
  function getNumShares(string _url, address _owner) view public returns (uint) {
      return sharesByOwnerByProjectUrl[_url][_owner];
  }

  function getTotalValue(string _url) view public returns (uint) {
      return totalValueByProjectUrl[_url];
  }

  function getShareValue(string url) view public returns (uint) {
      return shareValueByProjectUrl[url];
  }

  function getTotalNumShares(string _url) view public returns (uint) {
      return numSharesByProjectUrl[_url];
  }
}