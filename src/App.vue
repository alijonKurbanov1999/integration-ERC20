<template>
  <div class="container__loader" v-if="loading"></div>
  <div class="container" v-else>
    <form class="container__form">
      <button class="container__form-btn left-side">connect wallet</button>
      <div class="container__form-section">
        <div>
          <label for="amount">Amount</label>
          <input type="text" id="amount" class="input" v-model.trim="amount"/>
        </div>

        <select name="symbol" id="symbol" v-model="symbol" @change="tokenSelected">
          <option  v-for="token in tokens" :key="token" :value="token.symbol">{{ token.symbol }}</option>
        </select>
      </div>

      <label for="address">Address (recipient)</label>
      <input type="text" id="address" class="input" v-model.trim="addressRecipient"/>

      <h4>Your balance: {{ balance }} {{ symbol }}</h4>
      <h4>Your allowance: {{ allowance }}</h4>
      <hr/>
      <div class="container__form-buttons">
        <button class="container__form-btn" @click.prevent="getAllowanse">Get allowance</button>
        <button class="container__form-btn" @click.prevent="toAppr">Approve</button>
        <button class="container__form-btn" @click.prevent="transfer">Transfer</button>
      </div>
    </form>
  </div>
</template>

<script>
import { ERC20 } from '../abis'
import { BigNumber } from 'bignumber.js'
// import { Form, Field, ErrorMessage } from 'vee-validate'
// // import * as yup from 'yup'
const Web4 = require('@cryptonteam/web4')
export default {
  data () {
    return {
      contractAddresses: [
        '0x4b107a23361770534bd1839171bbf4b0eb56485c',
        '0xc13da4146d381c7032ca1ed6050024b4e324f4ef',
        '0x8d0c36c8842d1dc9e49fbd31b81623c1902b7819',
        '0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13'
      ],
      allInstances: {},
      addressRecipient: null,
      amount: null,
      symbol: 'USDT',
      balance: '100',
      allowance: '-',
      tokens: [],
      loading: true
    }
  },
  async mounted () {
    await this.initContract()
  },
  methods: {
    async initContract () { // dotenv
      const web4 = new Web4()
      web4.setHDWalletProvider(
        'trophy cluster danger depend royal dry empower front cheap rib vacant outside',
        'https://rinkeby.infura.io/v3/8ffeb2ff91d54896b65282dc1af35913'
      )
      const erc20 = web4.getContractAbstraction(ERC20)
      let i = 0
      for (const address of this.contractAddresses) {
        i += 1
        const instance = await erc20.getInstance(address)
        const tmp = await this.getTokenData(instance)
        this.allInstances[tmp.symbol] = instance
        this.tokens.push(tmp)
        console.log(`loaded ${i}/${this.contractAddresses.length}`)
      }
      this.loading = false
    },
    async getTokenData (instance) {
      const name = await instance.name()
      const symbol = await instance.symbol()
      const decimals = (await instance.decimals()).words[0]
      const allowance = (await instance.allowance('0x6870C9300b2166ffECce17B0598195dA629733C3', '0x6870C9300b2166ffECce17B0598195dA629733C3')).words[0]
      let balance = (await instance.balanceOf('0x6870C9300b2166ffECce17B0598195dA629733C3'))
      balance = new BigNumber(balance).shiftedBy(-decimals).toString()
      // console.log(await instance.transfer("0x6870C9300b2166ffECce17B0598195dA629733C3", 1500000));
      // console.log(await instance.approve("0x6870C9300b2166ffECce17B0598195dA629733C3", 500000));
      return {
        name,
        symbol,
        allowance,
        balance,
        decimals
      }
    },
    // ErrorTest () {
    //   console.log('Error amount: ', this.errorAmount = yup.number().required('Amount of tokens required!').min(6, 'Password cannot be less than 6'))
    //   console.log('Error address: ', this.errorAddress = yup.string().required('Address is required'))
    // },
    tokenSelected () {
      this.balance = (this.tokens.find(x => x.symbol === this.symbol) || {}).balance
    },
    getAllowanse () {
      this.allowance = (this.tokens.find(y => y.symbol === this.symbol) || {}).allowance
    },
    async toAppr () {
      try {
        const decimals = (this.tokens.find(y => y.symbol === this.symbol) || {}).decimals
        const amount = new BigNumber(this.amount).shiftedBy(+decimals).toString()
        await this.allInstances[this.symbol].approve(this.addressRecipient, amount)
        console.log('result')
      } catch (e) {
        console.log('approve error: ', e)
      }
    },
    async transfer () {
      this.loading = true
      // console.log('Address: ', this.addressRecipient)
      // console.log('Amount: ', this.amount)
      const decimals = (this.tokens.find(y => y.symbol === this.symbol) || {}).decimals
      const amount = new BigNumber(this.amount).shiftedBy(+decimals).toString()
      // console.log('Amount for contract: ', amount)
      await this.allInstances[this.symbol].transfer(this.addressRecipient, amount)
      // this.amount = null
      // this.addressRecipient = null
      this.loading = false
    }
  }
  // components: { Field, Form, ErrorMessage }
}
</script>

<style lang="scss"></style>
