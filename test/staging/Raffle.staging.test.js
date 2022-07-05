const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle staging tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts())["deployer"]
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntryFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live chainlink keepers and vrf", async function () {
                  console.log("Setting up test...")
                  const startingTimestamp = await raffle.getLastTimestamp()
                  const accounts = await ethers.getSigners()

                  console.log("Setting up Listener...")
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("winner picked event fired")
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              console.log(`Recent winner: ${recentWinner.toString()}`)
                              const raffleState = await raffle.getRaffleState()
                              console.log(`Raffle state: ${raffleState}`)
                              const endingTimeStamp = await raffle.getLastTimestamp()
                              console.log(`endingTimeStamp: ${endingTimeStamp}`)
                              const numPlayers = await raffle.getNumPlayers()
                              console.log(`numPlayers: ${numPlayers}`)
                              const winnerEndingBalance = await accounts[0].getBalance()
                              console.log(`winnerEndingBalance: ${winnerEndingBalance}`)

                              console.log(`accounts[0].address ${accounts[0].address}`)

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              console.log("here1")
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              console.log("here2")
                              assert.equal(raffleState, 0)
                              console.log("here3")
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              console.log("here4")
                              assert(endingTimeStamp > startingTimestamp)
                              console.log("here5")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })

                      console.log("Entering Raffle...")
                      await raffle.enterRaffle({ value: raffleEntranceFee })

                      console.log("Ok, time to wait...")
                      const winnerStartingBalance = await accounts[0].getBalance()
                  })
                  console.log("here10")
              })
              console.log("here11")
          })
          console.log("here12")
      })
console.log("here13")
