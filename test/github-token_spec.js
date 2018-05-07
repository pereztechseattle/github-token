const expectRevert = require('./helpers/expectRevert')
// import time from './helpers/time';

const GithubToken = artifacts.require('GithubToken')

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )

contract('GithubToken', async (accounts) => {
  let now
  let deployer = accounts[0]
  let usera = accounts[1]
  let userb = accounts[2]
  let userc = accounts[3]
  let theContract

  beforeEach(async () => {
    now = web3.eth.getBlock(web3.eth.blockNumber).timestamp

    theContract = await GithubToken.deployed()
  })

  describe('construction', async () => {
    it('should be initialized with a valid address', async () => {
      assert.ok(GithubToken.address)
    })

    it('should be ownable', async () => {
      expect(await theContract.owner()).to.equal(deployer)
    })
  })

  describe('adding a project', async () => {
    const projectUrl = 'testprojecta'

    it('should get a recipt ok', async () => {
      let receipt = await theContract.addProject(projectUrl, 9, { from: usera, value: web3.toWei(1, 'finney') })
      assert.ok(receipt)
    })

    it('should update total num stars', async () => {            
      let totalStars = await theContract.totalStars.call();
      expect(totalStars.toNumber()).to.equal(10);
    })

    it('should award the sender the appropriate number of shares', async () => {            
      // 90% * 1 finney = 1.1 * 1000 = 1111 shares
      let shares = await theContract.getNumShares(projectUrl, usera);
      expect(shares.toNumber()).to.equal(1111);
    })

    it('should calculate the correct price per share', async () => {
      // 1 finney / 1111 = 900090009000
      let price = await theContract.getShareValue(projectUrl);
      expect(price.toString()).to.equal('900090009000');
    })
  })

  describe('new user contributing to the same project', async () => {
    const projectUrl = 'testprojecta'

    it('should get a recipt ok', async () => {
      let receipt = await theContract.buy(projectUrl, { from: userb, value: web3.toWei(1, 'finney') })
      assert.ok(receipt)
    })

    it('should award the sender the appropriate number of shares', async () => {
      // 90% * 1 finney = 1.1 * 1000 = 1111 shares
      let shares = await theContract.getNumShares(projectUrl, usera);
      expect(shares.toNumber()).to.equal(1111);
    })

    it('should calculate the correct total num of shares', async () => {
      let totalNumShares = await theContract.getTotalNumShares(projectUrl);
      expect(totalNumShares.toNumber()).to.equal(2222);
    })

    it('should calculate the correct price per share', async () => {
      // 2 finney / 2222 = 900090009000
      let price = await theContract.getShareValue(projectUrl);
      expect(price.toString()).to.equal('900090009000');
    })
  })

  describe('update the project score', async () => {
    const projectUrl = 'testprojecta'

    it('should get a recipt ok', async () => {
      // from 90% to 67%
      let receipt = await theContract.updateProject(projectUrl, 2);
      assert.ok(receipt)
    })
  })

  describe('the same user sells half of their shares', async () => {
    const projectUrl = 'testprojecta'
    let balanceBefore = web3.fromWei(web3.eth.getBalance(userb), 'finney')

    it('should get a recipt ok', async () => {
      const numToSell = await theContract.getNumShares(projectUrl, userb);

      // from 90% to 67%
      let receipt = await theContract.sell(projectUrl, numToSell / 2, { from: userb });
      assert.ok(receipt)
    })

    it('should leave the user with the appropriate number of shares', async () => {
      // 50% * 1111 shares = 555.5 shares
      let shares = await theContract.getNumShares(projectUrl, userb);
      expect(shares.toNumber()).to.equal(556);
    })

    it('should calculate the correct total num of shares', async () => {
      // userb has half the projectb which is 2 finney so 2222 * 0.75 = 1666.5
      let totalNumShares = await theContract.getTotalNumShares(projectUrl);
      expect(totalNumShares.toNumber()).to.equal(1667);
    })

    it('should send 123 to the user address', async () => {
      let balanceAfter = web3.fromWei(web3.eth.getBalance(userb), 'finney')
      expect(balanceAfter).to.not.equal(balanceBefore);
    })
  })
})

/**
 * Helper to wait for log emission.
 * @param  {Object} _event The event to wait for.
 */
function promisifyLogWatch (_event) {
  return new Promise((resolve, reject) => {
    _event.watch((error, log) => {
      _event.stopWatching()
      if (error !== null) { reject(error) }

      resolve(log)
    })
  })
}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
function hashCode (s) {
  var h = 0, l = s.length, i = 0;
  if ( l > 0 )
    while (i < l)
      h = (h << 5) - h + s.charCodeAt(i++) | 0;
  return h;
};