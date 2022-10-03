import {Image, Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, Space, Col, Row, Typography, Avatar } from "antd";
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import axios from "axios"
import {
    useBalance,
    useContractLoader,
    useContractReader,
    useGasPrice,
    useOnBlock,
    useUserProviderAndSigner,
  } from "eth-hooks";

import { Address, Balance, Events } from "../components";
import { selectHttpOptionsAndBody } from "@apollo/client";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function SearchNFT({
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
    //this is the format for doing nested mappings i think
    //const result = await readContracts.NFProof.tokenToToken(nftCollection, originalTokenId);
    //const owner = await readContracts.NFProof.ownerOf(tokenId)
    

  const [searchContract, setSearchContract] = useState();
  const [searchToken, setSearchToken] = useState()
  const [dataRetrieval, setDataRetrieval] = useState(false)
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const hasTokenMinted = useContractReader(readContracts, "NFProof", "tokenHasMinted", [searchContract, searchToken]);
  const [tokenMint, setTokenMint] = useState(false)
  const [proofToken, setProofToken] = useState(null)
  const { Meta } = Card;



  const getMetadata = async() => {
    //need to switch this for mainnet prod
    const baseURL = `https://eth-goerli.g.alchemy.com/nft/v2/${process.env.REACT_APP_GOERLI_ALCHEMY_KEY}/getNFTMetadata`;
    const tokenType = "erc721";
    var config = {
        method: 'get',
        url: `${baseURL}?contractAddress=${searchContract}&tokenId=${searchToken}&tokenType=${tokenType}`,
        headers: { }
      };
    try {
        const response = await axios(config)
        setTokenMetadata(response.data);
        console.log("tokenMetadata:", tokenMetadata)
    } catch(e) {
        console.log(e)
        }
    }

  const handleSearch = async(e) => {
    e.preventDefault()
    try {
        await getMetadata()
        
    } catch(e) {
        console.log(e)
    }
    tokenMetadata ? setDataRetrieval(true): console.log('no tokenMetadata yet')
    try{
        const result = await readContracts.NFProof.tokenToToken(searchContract, searchToken);
        setProofToken(result)
        const owner = await readContracts.NFProof.ownerOf(result)
        owner ? setTokenMint(true): setTokenMint(false)
        console.log("tokenMint:", tokenMint)
    } catch(e) {
        setTokenMint(false)
        console.log("tokenMintCatch", tokenMint)
        console.log(e)
    }
  }

  
const CardCompon = () => {

  return (<Card
    hoverable
    style={{ width: 300 }}
    cover={
        <Image
        width={300}
        src={dataRetrieval && tokenMetadata ? tokenMetadata.metadata.image : "error"}
        fallback="data:image/png;base64,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"
    />  
    }
    
  >
    <Typography.Paragraph><Typography.Text strong>Name:</Typography.Text> {dataRetrieval && tokenMetadata ? tokenMetadata.contractMetadata.name:'error loading name'}</Typography.Paragraph>
    <Typography.Paragraph><Typography.Text strong>Token:</Typography.Text> {dataRetrieval && tokenMetadata ? tokenMetadata.id.tokenId:'error loading id'}</Typography.Paragraph>
    {tokenMint ?
        <>
            <Typography.Paragraph type = 'danger' strong>This proof of ownership token has already been minted.</Typography.Paragraph>
            <Typography.Paragraph strong>Click view for more info.</Typography.Paragraph>
            <Button type= "link" style={{backgroundColor: '#935bff', color:'white'}}><Link to={`/viewproof/${proofToken}`}>View</Link></Button>
        </>
        :
        <>
        <Typography.Paragraph type = 'success' strong>This token has not been minted yet.</Typography.Paragraph>
        <Button type= "link" style={{backgroundColor: '#8344ff', color:'white'}}><Link to={`/nfpminter/${searchContract}/${searchToken}`}>Mint</Link></Button>
        </>
}
  </Card>)}

  return (
    <>
        <Row justify="center">
        <Space direction="vertical">
            <Typography.Title
                            level={2} style ={{color: '#460fb3'}}
                        >NFP Token Minter</Typography.Title>
            <Typography.Text type="secondary"
                        >This token represents Proof of Ownership for the NFT.</Typography.Text>
        </Space>  
        </Row>
        <br></br>
        <Row>
                <Col span = {12}>
                <Space direction="vertical">
                <Typography.Title style ={{color: '#3c0d99'}}
                 level= {3}>Search NFT</Typography.Title>
                 
                 <br></br>
                 <Typography.Text type= 'primary' style ={{color: '#3c0d99'}}>
                    Token Details
                 </Typography.Text>
                 <br></br>
                    <Input placeholder="Contract Address"
                    value={searchContract}
                    onChange={e => {
                        setSearchContract(e.target.value);
                        console.log(searchContract)
                    }}>
                    </Input>
                    <br></br>
                    <Input placeholder="Token Id"
                    value={searchToken}
                    onChange={e => {
                        setSearchToken(e.target.value);
                        console.log(searchToken)
                    }}>
                    </Input>
                    <br></br>
                    <Button type= "link" style={{backgroundColor: '#460fb3', color:'white'}} onClick = {handleSearch} >Search</Button>
                </Space>

                </Col>


                <Col span = {12}>
                    <Space direction='vertical' wrap>
                    <Typography.Title style ={{color: '#3c0d99'}}
                        level= {3}>Token</Typography.Title>
                    
                    {dataRetrieval && tokenMetadata &&
                     <CardCompon />       
                    }
                    </Space>
                </Col>
        </Row>
    </>
  );
}
