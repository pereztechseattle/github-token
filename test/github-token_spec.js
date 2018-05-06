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

const getBalance = (account) =>
  promisify(cb => web3.eth.getBalance(account, 'latest', cb))

contract('GithubToken', async (accounts) => {
  const MINUTE = 60
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const MONTH = 30 * DAY
  const YEAR = 12 * MONTH

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
      expect(totalNumShares.toString()).to.equal('2222');
    })

    it('should calculate the correct price per share', async () => {
      // 2 finney / 2222 = 900090009000
      let price = await theContract.getShareValue(projectUrl);
      expect(price.toString()).to.equal('900090009000');
    })
  })
})

/**
 * Helper to wait for log emission.
 * @param  {Object} _event The event to wait for.
 */
function promisifyLogWatch(_event) {
  return new Promise((resolve, reject) => {
    _event.watch((error, log) => {
      _event.stopWatching()
      if (error !== null) { reject(error) }

      resolve(log)
    })
  })
}
