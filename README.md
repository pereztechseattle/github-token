# github-token
[This is a work in progress and a proof of concept]

A smart contract for github.com stats derived tokens.  The value of each project's "shares" will depend on the metrics of the associated project on github.com.  More stars, forks, 
commits, etc. should result in the value of that project's shares going up.  Shares can be bought and sold between the user and the contract, not between users.  This is sort of 
like an ongoing categorized prediction market.

## Calculating value
[TBD]
## Example

For simplicity, say we're just tracking two projects - projecta and projectb.  The project scores (summing to 1) and contract balance are:

`projecta=0.9, projectb=0.1, bal=10 ETH`

Q: How much is one share of projecta worth?  projectb?

Initial num shares = Total Project Value / Project Score.  Example for projecta:

`I = 9 ETH / 0.9 = 10`

Q: How many shares outstanding of each project?  

User wants to buy 1 ETH worth of projectb.  How many shares of projectb should the user be awarded?

`shares = msg.value / p = 1 / 0.1 = 10`

After the transaction, the state is:  

`projecta=0.9, projectb=0.1, bal=11 ETH`

Now let's say after some time projectb is roughly twice as popular and the state is now: 

`projecta=0.8, projectb=0.2, bal=11 ETH`

When the user sells back their 10 shares of projectb, we simply reverse the operation (multiply instead of divide) and use the new score of 0.2:

`10 * 0.2 = 2 ETH`

**So the user's value has doubled, which is what we would expect.**

We can also derive a price for projectb's shares by:

`2 ETH / 10 shares = 0.2ETH per share`

---
How many shares of projectb should the user be awarded?  (and how is it distinct from the other projects yet fungible?  need erc20s for each project?  NO.  Custom UI for now.. exchange tradable later.)
