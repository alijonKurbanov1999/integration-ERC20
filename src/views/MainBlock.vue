<template>
  <router-view v-if="loading"/>
  <div v-else class="container">
    <form class="container__form">
      <button class="container__form-btn left-side" @click.prevent="initContract">connect wallet</button>
      <div class="container__form-section">
        <div>
          <label for="amount">Amount</label>
          <input type="text" id="amount" class="input" v-model.trim="amount"/>
        </div>

        <select v-if="userAddress" name="symbol" id="symbol" v-model="tokenAddress">
          <option  v-for="[address, token] in Object.entries(tokens)" :key="address" :value="address">{{ token.data.symbol }}</option>
        </select>
      </div>

      <label for="address">Address (recipient)</label>
      <input type="text" id="address" class="input" v-model.trim="recipientAddress"/>

      <h4>Your balance: {{ balance }} {{ symbol }}</h4>
      <h4>Your allowance: {{ allowance }}</h4>
      <hr/>
      <div class="container__form-buttons">
        <button class="container__form-btn" @click.prevent="getAllowance">Get allowance</button>
        <button class="container__form-btn" @click.prevent="toAppr" :disabled="invalid" title="available after filling in the fields!">Approve</button>
        <button class="container__form-btn" @click.prevent="transfer" :disabled="invalid" title="available after filling in the fields!">Transfer</button>
      </div>
    </form>
  </div>
</template>

<script>
import Web3 from 'web3'
import { ERC20 } from '../../abis'
import { BigNumber } from 'bignumber.js'
const Web4 = require('@cryptonteam/web4')
export default {
  data () {
    return {
      tokens: {
        '0x4b107a23361770534bd1839171bbf4b0eb56485c': {},
        '0xc13da4146d381c7032ca1ed6050024b4e324f4ef': {},
        '0x8d0c36c8842d1dc9e49fbd31b81623c1902b7819': {},
        '0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13': {}
      },
      userAddress: null,
      recipientAddress: null,
      tokenAddress: null,
      amount: null,
      allowance: '-',
      loading: false
    }
  },
  computed: {
    balance () {
      const token = this.tokens[this.tokenAddress]
      return token ? token.data.balance : 100
    },
    symbol () {
      const token = this.tokens[this.tokenAddress]
      return token ? token.data.symbol : 'USDT'
    },
    invalid () {
      return this.amount === null && this.recipientAddress === null
    }
  },
  methods: {
    async initContract () { // dotenv
      this.loading = true
      const { ethereum } = window // ethereum - metamask
      const [account] = await ethereum.request({ method: 'eth_requestAccounts' })
      this.userAddress = account
      const provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/8ffeb2ff91d54896b65282dc1af35913')
      const web4 = new Web4()
      await web4.setProvider(provider, this.userAddress)
      const erc20 = web4.getContractAbstraction(ERC20)

      const tokensArr = Object.keys(this.tokens)
      let i = 0
      for (const address of tokensArr) {
        const isUsdt = address === '0x8d0c36c8842d1dc9e49fbd31b81623c1902b7819'
        this.tokens[address].instance = await erc20.getInstance(address)
        this.tokens[address].data = await this.getTokenData(this.tokens[address].instance)
        isUsdt && (this.tokenAddress = address)
        i += 1
        console.log(`loaded ${i}/${tokensArr.length}`)
      }
      this.loading = false
    },
    async getTokenData (instance) {
      const name = await instance.name()
      const symbol = await instance.symbol()
      const decimals = (await instance.decimals())
      let balance = (await instance.balanceOf(this.userAddress))
      balance = new BigNumber(balance).shiftedBy(-decimals).toString()
      return {
        name,
        symbol,
        balance,
        decimals
      }
    },
    async getAllowance () {
      this.allowance = (await this.tokens[this.tokenAddress].instance.allowance(this.userAddress, this.recipientAddress)).toString()
    },
    async toAppr () {
      try {
        const { ethereum } = window
        await ethereum.enable()
        const web4 = new Web4()
        await web4.setProvider(ethereum, this.userAddress)
        const absErc20 = web4.getContractAbstraction(ERC20)
        const inst = await absErc20.getInstance(this.tokenAddress)
        const amount = new BigNumber(this.amount).shiftedBy(+8).toString()
        await inst.approve(this.recipientAddress, amount)
      } catch (error) {
        console.log('Error: ', error)
      }
    },
    async transfer () {
      try {
        const { ethereum } = window
        await ethereum.enable()
        const web4 = new Web4()
        await web4.setProvider(ethereum, this.userAddress)
        const absErc20 = web4.getContractAbstraction(ERC20)
        const inst = await absErc20.getInstance(this.tokenAddress)
        const amount = new BigNumber(this.amount).shiftedBy(+8).toString()
        await inst.transfer(this.recipientAddress, amount)
      } catch (error) {
        console.error('Error: ', error)
      }
    }
  }
}
</script>

<style scoped>

</style>
