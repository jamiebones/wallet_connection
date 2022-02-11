import { useEffect, useState, useCallback } from "react";
import { ethers, providers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink';
import { useWallet } from './walletContext';

import './App.css';

const trimAddress = ( address ) => {
  const firstpart = address.slice(0, 4);
  const midpart = "....";
  const endpart = address.slice(address.length - 4, address.length );
  return `${firstpart}${midpart}${endpart}`
}

const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'


const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: INFURA_ID, // required
    },
  },
  'custom-walletlink': {
    display: {
      logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
      name: 'Coinbase',
      description: 'Connect to Coinbase Wallet (not Coinbase App)',
    },
    options: {
      appName: 'Coinbase', // Your app name
      networkUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
      chainId: 1,
    },
    package: WalletLink,
    connector: async (_, options) => {
      const { appName, networkUrl, chainId } = options
      const walletLink = new WalletLink({
        appName,
      })
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
      await provider.enable()
      return provider
    },
  },
}

let web3Modal
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true,
    providerOptions, // required
  })
}


function App() {
  const { account, setAccountDetails } = useWallet();
  const { provider,
    address,
    signer,
    web3Provider,
    network } = account;


const connect = useCallback(async function () {
  const provider = await web3Modal.connect();
  const web3Provider = new providers.Web3Provider(provider);
  const signer = web3Provider.getSigner()
  const address = await signer.getAddress()
  const network = await web3Provider.getNetwork();
  const accountDetails = {
       provider,
       web3Provider,
       signer,
       address,
       network
  }
  setAccountDetails(accountDetails);
}, []);



const disconnect = useCallback(
  async function () {
    await web3Modal.clearCachedProvider()
    if (provider?.disconnect && typeof provider.disconnect === 'function') {
      await provider.disconnect()
    }
    //reset the state here
    const accountDetails = {
      provider: null,
      web3Provider: null,
      signer: null,
      address: null,
      network: null
 }
 setAccountDetails(accountDetails);
  
},
  [provider]
)



  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect]);

  
  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        // eslint-disable-next-line no-console
        console.log('accountsChanged', accounts);
        setAccountDetails({
            ...account,
            address: accounts[0],
        })
      }

      const handleChainChanged = (_hexChainId) => {
        window.location.reload()
      }

      const handleDisconnect = (error) => {
        console.log('disconnect', error)
        disconnect()
      }

      provider.on('accountsChanged', handleAccountsChanged)
      provider.on('chainChanged', handleChainChanged)
      provider.on('disconnect', handleDisconnect)

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged)
          provider.removeListener('chainChanged', handleChainChanged)
          provider.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [provider, disconnect])







  return (
    <div className="App">
         {web3Provider ? (
               <button className="btn btn-danger" type="button" onClick={disconnect}>
                 {trimAddress(address)}
          </button>
        ) : (
          <button className="btn btn-success" type="button" onClick={connect}>
            Connect
          </button>
        )}
    </div>
  );
}

export default App;
