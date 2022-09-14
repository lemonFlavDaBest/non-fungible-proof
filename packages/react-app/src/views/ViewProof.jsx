import {Typography, Button, Card, DatePicker, Divider, Input, Progress, Slider, Space, Switch, Image, Row, Col, Descriptions, Badge, Result} from "antd";
import "../App.css";
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  HomeOutlined,
  LoadingOutlined,
  SettingFilled,
  SmileOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from "react";
import { utils, BigNumber } from "ethers";
import { useParams, Link } from "react-router-dom";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { Address, Balance, Events } from "../components";
import axios from "axios"


/*
The idea is to
 view the NFT. 
give original contract & id.
is there a user? set User?
owner?
valid?
Burn?

*/

export default function ViewProof({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const { Paragraph, Text } = Typography;
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [nftCollection, setNFTCollection] = useState();
  const [originalTokenId, setOriginalTokenId] = useState();
  const {proof_id}= useParams();
  const ownerObject = useContractReader(readContracts, "NFProof", "_owners", [proof_id]);
  const userOfProof = useContractReader(readContracts, "NFProof", "userOf", [proof_id]);
  const validateOwner = useContractReader(readContracts, "NFProof", "isValidOwner", [proof_id]);
  console.log("validateOwner", validateOwner)
  const validateUser = useContractReader(readContracts, "NFProof", "isValidUserToken", [proof_id]);
  const ownerAddress = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.owner;
  const ownerOGContract = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalContract;
  const ownerOGToken = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalTokenId;
  console.log("ownerOGContract:", ownerOGContract)
  
  //const [proofTokenId, setProofTokenId] = useState();
  const [tokenMetadata, setTokenMetadata] = useState(null);
  console.log("refreshedtokenMetadata", tokenMetadata)
  const [userObject, setUserObject] = useState();
  const [dataRetrieval, setDataRetrieval] = useState(false)

  const noWallet =() => {
    <Text type="warning">No Wallet Assigned</Text>
  }

  const getMetadata = useCallback(async() => {
    //need to switch this for mainnet prod
    const baseURL = `https://eth-goerli.g.alchemy.com/nft/v2/${process.env.REACT_APP_GOERLI_ALCHEMY_KEY}/getNFTMetadata`;
    const tokenType = "erc721";
    var config = {
        method: 'get',
        url: `${baseURL}?contractAddress=${ownerOGContract}&tokenId=${ownerOGToken}&tokenType=${tokenType}`,
        headers: { }
      };
    try {
        const response = await axios(config);
        console.log("response", response.data)
        setTokenMetadata(response.data);
    } catch(e) {
        console.log(e);
    }
  }, [ownerOGContract, ownerOGToken])

  const gridStyle = {
    width: '25%',
    textAlign: 'center',
  };

  useEffect(() => {
    const updateOwnerObject = async () => {
      console.log("ownerAddress:", ownerAddress)
      console.log("proof_id:", proof_id);
      const userResult = await readContracts.NFProof._users(proof_id);
      console.log("userResult:", userResult);
      setUserObject(userResult);
      await getMetadata();
      tokenMetadata ? setDataRetrieval(true): console.log('no tokenMetadata yet')
    }
    ownerAddress && updateOwnerObject();
  }, [address, ownerAddress, getMetadata])

  return (
    <>
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Row gutter={16}>
        
        <Col span={8}>
          <Card title="Owner Info:" bordered={false}>
            
            Owner: <Address address = {ownerAddress && ownerAddress ? ownerAddress: null}  
            fontSize = {12}/>
            <br></br>
            Owner's Wallet: {userObject && userObject[0].user>0 ? <Address address = {userObject[0].user}  
            fontSize = {12}/>: "unassigned"}
            <br></br>
            NFP: #{proof_id}
            
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Proof of NFT:" bordered={false}>
              {dataRetrieval && tokenMetadata.title}
              <br></br>
              Contract Address: <Address
                address={ownerAddress && ownerAddress ? ownerObject.originalContract : null}
                ensProvider={mainnetProvider}
                fontSize={6}
                />
                <br></br>
              Token Id: {ownerAddress && ownerAddress ? ownerObject.originalTokenId.toNumber() : null}
              <br></br>
              <a href={`https://etherscan.io/token/`}>View on Etherscan</a>
            </Card>
        </Col>
        <Col span={8}>
          <Card title="Owner Actions:" bordered={false}>
            <Link to={`/editproof/${proof_id}`}>Assign Owner Wallet</Link>
            <br></br>
            <br></br>
            <Link to={`/burnproof/${proof_id}`}>Burn NFP Token</Link>
            <br></br>
            <br></br>
          </Card>
        </Col>  
      </Row>
      </Space>

      <Row gutter={[16, 24]} align = "middle">
        <Col span = {14}>
        
            <Image
            width={400}
            height={400}
            src={ownerAddress && tokenMetadata ? tokenMetadata.metadata.image : "error"}
            fallback="data:image/png;base64,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"
            />  
          
        </Col>
        <Col span = {10}>
            
              {ownerAddress && validateOwner ? <Result
                        icon={<CheckCircleTwoTone />}
                        title="Confirmed Owner"
                      /> : <Result
                      title="Ownership Lost"
                      icon={<CloseCircleTwoTone />}
                      subtitle="Ownership of this nft has changed"
                    />}
              
              {ownerAddress && validateOwner && validateUser ? <Result
                        icon={<CheckCircleTwoTone />}
                        title="Valid Owner Wallet"
                      /> : <Result
                      icon={<CloseCircleTwoTone />}
                    /> }
            
        </Col>
      </Row>
      </>
  );
}
