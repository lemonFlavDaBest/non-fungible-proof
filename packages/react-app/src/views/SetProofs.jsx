import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List, Result, Row, Col } from "antd";
import React, { useState, useEffect } from "react";
import { utils, BigNumber } from "ethers";
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

/*
I think this component will give people the proofs they own, if there is a current user, and to set the user of the tokens
Similar to viewproofs, but list only the owners, then give the ability to add users to it or edit.
List of tokens:
3 columns I think:  owner and the token, if current user and set user, what the token represents
*/

/*
<Result
                            status= {validateObject && validateObject.isValid == true? "success" : "error"}
                            title="Token Validation:"
                          />
*/


export default function SetProofs({
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
  
  const [mintAddress, setMintAddress] = useState();
  const balance = useContractReader(readContracts, "NFProof", "balanceOf", [address]);
  const [ownershipToAddresses, setOwnershipToAddresses] = useState({});
  console.log("🤗 balance:", balance);
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourProofTokens, setYourProofTokens] = useState([]);
  const [userTokens, setUserTokens] = useState()
  const [validateTokens, setValidateTokens] = useState()
  const [expiryTime, setExpiryTime] = useState()
  const [ownerTokens, setOwnerTokens] = useState()

  useEffect(() => {
    //I want this function to get make an array of validation objects with corresponding tokenId and boolean validation
    const updateValidateTokens = async () => {
    const validationInfo = [];
    for(let i = 0; i <yourProofTokens.length; i++) {
      const tokenId = yourProofTokens[i].id;
      const result = await readContracts.NFProof.isValidUserToken(tokenId);
      console.log("isValidUserToken_result:", result)
      validationInfo.push({proofTokenId: tokenId, isValid: result})
    }
    setValidateTokens(validationInfo)
  }
  updateValidateTokens()
  }, [yourProofTokens])

  useEffect(() => {
    const updateYourProofTokens = async () => {
      const proofTokensUpdate = [];
      const ownerInfo = [];
      for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenId = await readContracts.NFProof.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const ownerObject = await readContracts.NFProof._owners(tokenId.toNumber())
          
          try {
            proofTokensUpdate.push({id: tokenId, owner:address});
            ownerInfo.push(ownerObject);
            console.log("ownerInfo:", ownerInfo)
            console.log("proofTokenUpdates:", proofTokensUpdate);
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      console.log("proofTokenUpdatesFINAL:", proofTokensUpdate)
      console.log("ownerInfoFinal:", ownerInfo)
      setYourProofTokens(proofTokensUpdate);
      setOwnerTokens(ownerInfo);
      
    };
    updateYourProofTokens();
  }, [address, yourBalance]);

  useEffect(() => {
    //I want this function to get more information about each token, such as the user, expiry, setuser, what the token represents
    //use this mapping
    const updateUserTokens = async () => {
    const userInfo = [];
    for(let i = 0; i <yourProofTokens.length; i++) {
      const tokenId = yourProofTokens[i].id;
      //use id to find users
      console.log("getting user from tokenId:", tokenId)
      const user = await readContracts.NFProof.userOf(tokenId.toNumber())
      console.log("usertohexstring:", user)
      if (user == '0x0000000000000000000000000000000000000000') {
        userInfo.push({user: 0, proofTokenId: tokenId});
      }else {
        const userObject = await readContracts.NFProof._users(tokenId);
        userInfo.push(userObject);
      }
      console.log("i:", i, "userInfo:",userInfo)
    }
    setUserTokens(userInfo)
  }
  updateUserTokens()
  }, [yourProofTokens])

  const onDateChange = (date, dateString) => {
    console.log(date, dateString);
    const reformDate = new Date(dateString);
    const timestampInSeconds = Math.floor(reformDate.getTime() / 1000);
    setExpiryTime(timestampInSeconds);
    console.log("UNIX TimeStamp:", timestampInSeconds);
    return timestampInSeconds;
  };

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
    <div >
        <List
                bordered
                dataSource={yourProofTokens}
                itemLayout="vertical"
                
                renderItem={(item) => {
                  const proofTokensId = item.id.toNumber();
                  const userObject = userTokens.find(({proofTokenId}) => proofTokenId.toNumber() == proofTokensId );
                  const ownerObject = ownerTokens.find(({proofTokenId}) => proofTokenId.toNumber() == proofTokensId );
                  const validateObject = validateTokens.find(({proofTokenId}) => proofTokenId.toNumber() == proofTokensId)
                  
                  return (
                    <div >
                    <List.Item key={proofTokensId}>
                      
                        <Row gutter={12}>
                          <Col span={8}>
                          <Card
                              title={
                                <div>
                                  <span style={{ fontSize: 16, marginRight: 8 }}>Token</span>
                                </div>
                              }
                              bordered = {false}
                            >
                              <h3>POOT #{proofTokensId}</h3>
                              
                              <p>Proof of Ownership of Token ID: {ownerObject && ownerObject.originalTokenId ? ownerObject.originalTokenId.toNumber() : null}</p>

                              From Contract: 
                              <Address 
                                address = {ownerObject && ownerObject.originalContract ? ownerObject.originalContract : null}
                                ensProvider={mainnetProvider}
                                fontSize={16}
                                />
                              

                        
                          </Card>
                          </Col>
                          <Col span={8}>
                          <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>User Info</span>
                          </div>
                        }
                        bordered = {false}
                      >
                          <Address
                            address={userObject && userObject.user > 0 ? userObject.user : null}
                            ensProvider={mainnetProvider}
                            fontSize={16}
                          />
                          
                      </Card>
                          </Col>
                          
                          <Col span={8}>
                          <Card
                              title = "Token Validation"
                              bordered = {false}
                            >
                            <Result
                            
                            status= {validateObject && validateObject.isValid == true? "success" : "error"}
                          />
                          </Card>
                          </Col>
                        </Row>
                        
                      
                    </List.Item>
                    </div>
                  );
                }}
              />
    </div>
  );
}
