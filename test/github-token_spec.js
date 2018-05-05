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
    it('should award the sender the appropriate number of shares for the project', async () => {
      let receipt = await theContract.addProject('github.com/pereztechseattle/github-token', 9)

      assert.ok(receipt);
    })

    it('should calculate the correct price per share', async () => {
      
    })

    // it('should have a 1 finney minimum bet', async () => {
    //   let minimumBet = await theContract.minimumBet.call()

    //   expect(minimumBet.valueOf()).to.equal(web3.toWei(1, 'finney'))
    // })

    // it('should be endowed with 10 Ether', async () => {
    //   let balance = await getBalance(GithubToken.address)

    //   expect(balance.toString()).to.equal(web3.toWei(10, 'ether'))
    // })
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
