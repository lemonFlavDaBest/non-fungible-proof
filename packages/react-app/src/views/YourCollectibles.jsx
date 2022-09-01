import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List } from "antd";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import { IdcardOutlined, SyncOutlined } from "@ant-design/icons";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";

import { Address, Balance, Events, AddressInput } from "../components";
import { create } from 'ipfs-http-client'
const { BufferList } = require("bl");
const { ethers } = require('ethers')

const ipfs = create({
    host: "ipfs.nifty.ink",
    port: "3001",
    protocol: "https",
  });
  

const getFromIPFS = async hashToGet => {
    for await (const file of ipfs.get(hashToGet)) {
      console.log(file.path);
      if (!file.content) continue;
      const content = new BufferList();
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      console.log("thisthecontent")
      console.log(content);
      return content;
    }
  };


const STARTING_JSON = {
    description: "It's actually a bison?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/buffalo.jpg",
    name: "Buffalo",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "green",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
    ],
  };

export default function YourCollectibles({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  blockExplorer
}) {
  const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address]);
  console.log("🤗 balance:", balance);

  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);

          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);

          const jsonManifestBuffer = await getFromIPFS(ipfsHash);
          console.log("jsonManifestbuffer", jsonManifestBuffer)

          try {
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            console.log("jsonManifest", jsonManifest);
            collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
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

  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();
  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [minting, setMinting] = useState(false);
  const [count, setCount] = useState(1);

  // the json for the nfts
  const json = {
    1: {
      description: "It's actually a bison?",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/buffalo.jpg",
      name: "Buffalo",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "green",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 42,
        },
      ],
    },
    2: {
      description: "What is it so worried about?",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/zebra.jpg",
      name: "Zebra",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "blue",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 38,
        },
      ],
    },
    3: {
      description: "What a horn!",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/rhino.jpg",
      name: "Rhino",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "pink",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 22,
        },
      ],
    },
    4: {
      description: "Is that an underbyte?",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/fish.jpg",
      name: "Fish",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "blue",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 15,
        },
      ],
    },
    5: {
      description: "So delicate.",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/flamingo.jpg",
      name: "Flamingo",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "black",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 6,
        },
      ],
    },
    6: {
      description: "Raaaar!",
      external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
      image: "https://austingriffith.com/images/paintings/godzilla.jpg",
      name: "Godzilla",
      attributes: [
        {
          trait_type: "BackgroundColor",
          value: "orange",
        },
        {
          trait_type: "Eyes",
          value: "googly",
        },
        {
          trait_type: "Stamina",
          value: 99,
        },
      ],
    },
  };

  const mintItem = async () => {
    // upload to ipfs
    const uploaded = await ipfs.add(JSON.stringify(json[count]));
    setCount(count + 1);
    console.log("Uploaded Hash: ", uploaded);
    const result = tx(
      writeContracts &&
        writeContracts.YourCollectible &&
        writeContracts.YourCollectible.mintItem(address, uploaded.path),
      update => {
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
      },
    );
  };

  return (
    <>
    <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <Button
                disabled={minting}
                shape="round"
                size="large"
                onClick={() => {
                  mintItem();
                }}
              >
                MINT NFT
              </Button>
            </div>
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.name}
                          </div>
                        }
                      >
                        <div>
                          <img src={item.image} style={{ maxWidth: 150 }} />
                        </div>
                        <div>{item.description}</div>
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
                            tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
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
    </>
  );
}