import { Space, Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List, Result, Row, Col,Typography } from "antd";
import React, { useState, useEffect } from "react";
import { utils, BigNumber } from "ethers";
import { DeleteRowOutlined, SyncOutlined } from "@ant-design/icons";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { Address, Balance, Events, AddressInput } from "../components";
import {Link} from "react-router-dom"

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


export default function MyNFPs({
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
  const { Paragraph, Text } = Typography;
  const [mintAddress, setMintAddress] = useState();
  const balance = useContractReader(readContracts, "NFProof", "balanceOf", [address]);
  const totalSupply = useContractReader(readContracts, "NFProof", "totalSupply", []);
  const [ownershipToAddresses, setOwnershipToAddresses] = useState({});
  console.log("🤗 balance:", balance);
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourProofTokens, setYourProofTokens] = useState([]);
  const [userTokens, setUserTokens] = useState()
  const [validateTokens, setValidateTokens] = useState()
  const [expiryTime, setExpiryTime] = useState()
  const [ownerTokens, setOwnerTokens] = useState()
  const [loadingState, setLoadingState] = useState(false)
  const [hotWalletState, setHotWalletState] = useState(false)

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
            proofTokensUpdate.push({id: tokenId.toNumber(), owner:address});
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

    const updateYourProofOwnerTokens = async () => {
      const proofTokensUpdate = [];
      const userInfo = [];
      for (let tokenIndex = 1; tokenIndex < totalSupply; tokenIndex++) {
        try {
          console.log("GEtting token index", tokenIndex);
          const tokenUser = await readContracts.NFProof.userOf(tokenIndex);
          console.log("tokenId", tokenIndex);
          if (tokenUser === address){
          const userObject = await readContracts.NFProof._users(tokenIndex)
          try {
            proofTokensUpdate.push({id: tokenIndex, owner:address});
            userInfo.push(userObject);
            console.log("ownerInfo:", userInfo)
            console.log("proofTokenUpdates:", proofTokensUpdate);
          } catch (e) {
            console.log(e);
          }
          }
        } catch (e) {
          console.log(e);
        }
      }
      
      console.log("proofTokenUpdatesFINAL:", proofTokensUpdate)
      console.log("ownerInfoFinal:", userInfo)
      setYourProofTokens(proofTokensUpdate);
      setOwnerTokens(userInfo);

    }

    hotWalletState ? updateYourProofOwnerTokens(): updateYourProofTokens();
    setLoadingState(false)
  }, [address, yourBalance, hotWalletState]);

  useEffect(() => {
    //I want this function to get more information about each token, such as the user, expiry, setuser, what the token represents
    
    const updateUserTokens = async () => {
    const userInfo = [];
    for(let i = 0; i <yourProofTokens.length; i++) {
      const tokenId = yourProofTokens[i].id;
      //use id to find users
      console.log("getting user from tokenId:", tokenId)
      const user = await readContracts.NFProof.userOf(tokenId)
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

  const onChange = () => {
    setLoadingState(true)
    hotWalletState ? setHotWalletState(false) : setHotWalletState(true);
  };


  return (
    <>
        <Row justify = 'center'>
          <Space direction='vertical' style={{ display: 'flex' }}>
            <Row justify = 'center'>
                <Typography.Title level={3} style ={{color: '#460fb3'}}>View Your NFP Tokens</Typography.Title>
            </Row>
            <Row justify = 'center'>
            <Paragraph type="secondary">'Cold' wallet will show NFP tokens you have minted. 'Hot' wallet will show NFP tokens that you are assigned as owner.</Paragraph>
            </Row>
            <Row justify='center'>
              <Switch defaultChecked checkedChildren="Cold" unCheckedChildren="Hot" onChange={onChange} loading={loadingState}/>
              <br></br>
            </Row>
          </Space>
          </Row>
        <List
                bordered = {false}
                dataSource={yourProofTokens}
                itemLayout="vertical"
                
                renderItem={(item) => {
                  const proofTokensId = item.id;
                  const userObject = userTokens.find(({proofTokenId}) => proofTokenId == proofTokensId );
                  const ownerObject = ownerTokens.find(({proofTokenId}) => proofTokenId == proofTokensId );
                  const validateObject = validateTokens.find(({proofTokenId}) => proofTokenId == proofTokensId)
                  
                  return (
                    <div>
                    <List.Item key={proofTokensId}>
                      
                        <Row gutter={12}>
                          <Col span={8}>
                          <Card
                              title={
                                <div>
                                  <span style={{ fontSize: 16, marginRight: 8, color: '#3c0d99' }}>Token</span>
                                </div>
                              }
                              bordered = {false}
                            >
                              <Row gutter={12}>
                              <Col>
                              
                              <Space direction='vertical'>
                                <Row justify='center'>
                                <Paragraph style ={{color:'#3c0d99'}}> <Text strong>NFP Token </Text>#{proofTokensId}</Paragraph>
                                </Row>
                                <Row justify='center'>
                                  <Text strong>Proof of Token:</Text>
                                </Row>
                                <Row>
                                <Paragraph>From Contract:
                                  <Address 

                                    address = {ownerObject && ownerObject.originalContract ? ownerObject.originalContract : null}
                                    ensProvider={mainnetProvider}
                                    fontSize={16}
                                    />
                                </Paragraph>
                                
                                <Paragraph>Token ID:{ownerObject && ownerObject.originalTokenId&& ownerObject.originalTokenId.toNumber ? ownerObject.originalTokenId.toNumber() : null}</Paragraph>
                                </Row>
                                <Row justify='center'>
                                  <Link to={`/viewproof/${proofTokensId}`} style ={{color: '#434190'}}>View Token</Link>
                                </Row>
                                
                              </Space>  
                              </Col>
                              
                              </Row>


                              
                              

                        
                          </Card>
                          </Col>
                          <Col span={8}>
                          <Card
                        title={
                          <div>
                            <span style={{ fontSize: 16, marginRight:8, color: '#3c0d99' }}>Owner Wallets</span>
                          </div>
                        }
                        bordered = {false}
                      >   
                          <Row>
                          <Col>
                          
                          <Row>
                          <Text strong>Minter:</Text> <Address
                            address={address}
                            ensProvider={mainnetProvider}
                            fontSize={12}
                          />
                          </Row>
                          <Row>
                          <Text strong>Delegated Owner: </Text> {userObject && userObject.user > 0 ? <Address
                            address={userObject && userObject.user > 0 ? userObject.user : null}
                            ensProvider={mainnetProvider}
                            fontSize={12}
                          />: <Text disabled>No wallet assigned</Text>}
                          </Row>
                          
                          </Col>
                          </Row>
                          
                      </Card>
                          </Col>
                          
                          <Col span={8}>
                          <Card
                              title = {<>
                                    <Text style = {{color: '#3c0d99', justifyContent:'center'}}>Token Validation</Text>
                                </>}
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
    </>
  );
}
