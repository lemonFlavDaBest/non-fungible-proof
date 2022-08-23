import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";


import { Address, Balance, Events, AddressInput } from "../components";

export default function Minter({
  purpose,
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
  const balance = useContractReader(readContracts, "NFProof", "balanceOf", [address]);
  
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [proofCollectibles, setProofCollectibles] = useState();

  useEffect(() => {
    const updateProofCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.NFProof.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          try {
            collectibleUpdate.push({id: tokenId, owner:address});
            console.log("collectibleUpdate:", collectibleUpdate)
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setProofCollectibles(collectibleUpdate);
    };
    updateProofCollectibles()
    console.log("proofCollectibles:", proofCollectibles)
  }, [address, yourBalance]);

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

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Minter:</h2>
        <h4>Mint your NFT Proof token</h4>
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
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const cost = utils.parseEther(".01");
              const result = tx(writeContracts.NFProof.safeMint(nftCollection, originalTokenId, {value: cost}), update => {
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
            }}
          >
            Mint!
          </Button>
        </div>
        </div>
        <List
                bordered
                dataSource={proofCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span>
                          </div>
                        }
                      >
                        <div>{id}</div>
                        Your Contract Address:
                          <Address
                            address={readContracts && readContracts.NFProof ? readContracts.NFProof.address : null}
                            ensProvider={mainnetProvider}
                            fontSize={16}
                          />
                      </Card>

                      <div>
                        owner:{" "}
                        <Address
                          address={item.owner}
                          ensProvider={mainnetProvider}
                          blockExplorer={blockExplorer}
                          fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.NFProof.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
    </div>
  );
}
