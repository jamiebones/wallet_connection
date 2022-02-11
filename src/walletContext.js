import * as React from "react";


const WalletContext = React.createContext();

const accountDetails = {
    provider: null,
    address: null,
    signer: null,
    web3Provider: null,
    network: null
}

function WalletProvider({children}){
  const [account, setAccountDetails ] = React.useState(accountDetails);
  const value = { account, setAccountDetails };
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

function useWallet(){
    const context = React.useContext(WalletContext);
    if (!context){
        throw new Error("useWallet must be used within a WalletProvider")
    }
    return context;
}

export {WalletProvider, useWallet }