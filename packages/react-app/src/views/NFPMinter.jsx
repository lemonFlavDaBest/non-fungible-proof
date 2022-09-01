import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, Space, Col, Row,  Typography } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import axios from "axios"

import { Address, Balance, Events } from "../components";

export default function NFPMinter({
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
    
    // I want user to flip a switch kind of thing to either mint with ape or mint with eth

  const [searchContract, setSearchContract] = useState();
  const [searchToken, setSearchToken] = useState()
  const [proofToken, setProofToken] = useState({})
  const [yourToken, setYourToken] = useState()

  const getMetadata = async() => {
    const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${process.env.REACT_APP_GOERLI_ALCHEMY_KEY}/getNFTMetadata`;
    const tokenType = "erc721";
    var config = {
        method: 'get',
        url: `${baseURL}?contractAddress=${searchContract}&tokenId=${searchToken}&tokenType=${tokenType}`,
        headers: { }
      };
    try {
        const response = await axios(config)
        const data = JSON.stringify(response, null, 2)
        return data
    } catch(e) {
        console.log(e)
    }
    }

  const handleSearch = async() => {
    const tokenUpdate = [];
    try {
        const yourMetadata = await getMetadata()
        console.log("yourMetadata:", yourMetadata)
        tokenUpdate.push(yourMetadata)
        setYourToken(tokenUpdate)
    } catch(e) {
        console.log(e)
    }
  }
  const getApproved = () => {

  }
 
  const payWithApe = () => {

  }

  const payWithEth = () => {

  }

  const getTokenPaidBool = () => {

  }

  return (
    <>
        <Row justify="center">
        <Space direction="vertical">
            <Typography.Title
                            level={2}
                        >Mint Non-Fungible Proof (NFP) Token</Typography.Title>
            <Typography.Text
                        >This token represents Proof of Ownership of your NFT</Typography.Text>
        </Space>  
        </Row>
        <br></br>
        <Row>
                <Col span = {12}>
                <Space direction="vertical">
                <Typography.Title
                 level= {5}>Search NFT to Mint Proof of Ownership</Typography.Title>
                 <br></br>
                    <Input placeholder="Contract Address"
                    onChange={e => {
                        setSearchContract(e.target.value);
                    }}>
                    </Input>
                    <Input placeholder="Token Id"
                    onChange={e => {
                        setSearchToken(e.target.value);
                    }}>
                    </Input>
                    <Button onClick = {handleSearch}>Search</Button>
                </Space>

                </Col>


                <Col span = {12}>
                    <Space direction='vertical' wrap>
                    <Typography.Title
                        level= {4}>Token</Typography.Title>
                    
                    {proofToken > 0 && 
                    <>
                        <Button>Mint</Button>
                        <Typography.Text
                        >This token will represent Proof of Ownership for your NFT</Typography.Text>
                    </>
                    }
                    </Space>
                </Col>
        </Row>
    </>
  );
}
