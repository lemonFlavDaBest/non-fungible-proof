import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List } from "antd";
import React, { useState, useEffect } from "react";
import { utils, BigNumber } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import {
  useBalance,
  useContractExistsAtAddress,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";


import { Address, Balance, Events, AddressInput } from "../components";
import { parseEther } from "ethers/lib/utils";

export default function Burner({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer,
}) {
  const [nftCollection, setNFTCollection] = useState();
  const [originalTokenId, setOriginalTokenId] = useState();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [proofCollectibles, setProofCollectibles] = useState({});
  const [newPurpose, setNewPurpose] = useState()
  const [currentPurpose, setCurrentPurpose] = useState("")
  //const [ogObject, setOGObject] = useState();
  //const balance = useContractReader(readContracts, "NFProof", "tokenToToken", nftCollection, originalTokenId);
  //const yourBalance = balance && balance.toNumber && balance.toNumber();


  /*async function onMint() {
     //look how you call setPurpose on your contract: 
     //notice how you pass a call back for tx updates too 
            const result = tx(writeContracts.YourContract.setPurpose(newPurpose), update => {
              console.log("📡 Transaction Update:", update);
              if (update && (update.status === "confirmed" || update.status === 1)) {
                console.log(" 🍾 Transaction " + update.hash + " finished!");
                console.log(
                  " ⛽️ " +
                    update.gasUsed +
                    "/" +
                    (update.gasLimit || update.gas) +
                    " @ " +
                    parseFloat(update.gasPrice) / 1000000000 +
                    " gwei",
                );
              }
            });
            console.log("awaiting metamask/web3 confirm result...", result);
            console.log(await result);
          
  }*/

  /*const onClick={ async () => {
    const cost = utils.parseEther(".01");
    console.log("writeContracts", writeContracts);
    const result = tx(writeContracts.TheBurn.burn(nftCollection, originalTokenId, proofCollectibles, {value: cost}), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
              update.gasUsed +
              "/" +
              (update.gasLimit || update.gas) +
              " @ " +
              parseFloat(update.gasPrice) / 1000000000 +
              " gwei",
          );
        }
      });
      console.log("awaiting metamask/web3 confirm result...", result);
      console.log(await result);
  }}*/

  const callBurnFunction = async() => {

  }

  useEffect(() => {
    const updatePurpose = async() => {
    try{
       const result = await readContracts.TheBurn.purpose()
       setCurrentPurpose(result)
    }
    catch (err){
        console.log(err)
    }
    }
    updatePurpose()
  },[])

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <Divider />
        <h2>Find Proof Token</h2>
        <h4>Burn Your NFP</h4>
        <Divider />
        <div style={{ margin: 8 }}>
          Add Your NFT Collection
          <Input
            onChange={e => {
              setNFTCollection(e.target.value);
            }}
          ></Input>
          Add your Token Id
          <Input
            onChange={e => {
              setOriginalTokenId(parseInt(e.target.value));
            }}
          ></Input>
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const result = await readContracts.NFProof.tokenToToken(nftCollection, originalTokenId);
              console.log("awaiting metamask/web3 confirm result...", result);
              setProofCollectibles(result.toNumber())
              console.log("proofCollectibles:", proofCollectibles)
            }}
          >
            Search!
          </Button>
        </div>
        </div>
                    <Card          
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>Burn Token </span>
                          </div>
                        }
                      >
                        Your Contract Address:
                          <Address
                            address={readContracts && readContracts.NFProof ? readContracts.NFProof.address : null}
                            ensProvider={mainnetProvider}
                            fontSize={16}
                          />
                      </Card>

                      

                      <div>

                        {proofCollectibles> 0 && <Button 
                        onClick={async () => {
                            /* look how you call setPurpose on your contract: */
                            /* notice how you pass a call back for tx updates too */
                            const cost = parseEther(".01")
                            console.log(nftCollection, originalTokenId,proofCollectibles, cost)
                            const result = tx(writeContracts.TheBurn.burner(nftCollection, originalTokenId, proofCollectibles, {value: cost}), update => {
                              console.log("📡 Transaction Update:", update);
                              if (update && (update.status === "confirmed" || update.status === 1)) {
                                console.log(" 🍾 Transaction " + update.hash + " finished!");
                                console.log(
                                  " ⛽️ " +
                                    update.gasUsed +
                                    "/" +
                                    (update.gasLimit || update.gas) +
                                    " @ " +
                                    parseFloat(update.gasPrice) / 1000000000 +
                                    " gwei",
                                );
                              }
                            });
                            console.log("awaiting metamask/web3 confirm result...", result);
                            console.log(await result);
                          }} >
                          Burn Token ID {proofCollectibles}
                        </Button>}
                        
                      </div>
    </div>
  );
}