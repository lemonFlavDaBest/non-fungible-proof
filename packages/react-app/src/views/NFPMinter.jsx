import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List, Row, Col, Image, Space, Typography } from "antd";
import React, { useState, useEffect } from "react";
import tw from "twin.macro";
import { ReactComponent as SvgDotPatternIcon } from "../images/dot-pattern.svg";
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
import { Link, Route, useLocation, useParams, useHistory } from "react-router-dom";
import { Address, Balance, Events, AddressInput } from "../components";
import axios from "axios"

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
  blockExplorer,
  contractConfig
}) {
  const Container = tw.div`relative`;
  const SingleColumn = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;
  const Content = tw.div`mt-16`;
  const SvgDotPattern1 = tw(
    SvgDotPatternIcon
  )`absolute top-0 left-0 transform -translate-x-20 rotate-90 translate-y-8 -z-10 opacity-25 text-primary-500 fill-current w-24`;
  const SvgDotPattern2 = tw(
    SvgDotPatternIcon
  )`absolute top-0 right-0 transform translate-x-20 rotate-45 translate-y-24 -z-10 opacity-25 text-primary-500 fill-current w-24`;
  const SvgDotPattern3 = tw(
    SvgDotPatternIcon
  )`absolute bottom-0 left-0 transform -translate-x-20 rotate-45 -translate-y-8 -z-10 opacity-25 text-primary-500 fill-current w-24`;
  const SvgDotPattern4 = tw(
    SvgDotPatternIcon
  )`absolute bottom-0 right-0 transform translate-x-20 rotate-90 -translate-y-24 -z-10 opacity-25 text-primary-500 fill-current w-24`;

  let history = useHistory();
  const balance = useContractReader(readContracts, "NFProof", "balanceOf", [address]);
  console.log("baaaalance:", balance)
  const {search_contract, search_token}= useParams();
  const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [proofCollectibles, setProofCollectibles] = useState();
  const ownerAddress = null
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [activeTabKey1, setActiveTabKey1] = useState('tab1');
  const tokenPaidBool = useContractReader(readContracts, "NFProof", "tokenHasBeenPaidfor", [search_contract, search_token]);
  const tokenMintBool = useContractReader(readContracts, "NFProof", "tokenHasMinted", [search_contract, search_token]);
  const tokenToToken = useContractReader(readContracts, "NFProof", "tokenToToken", [search_contract, search_token]);
  
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);
  const getBalance = useContractReader(mainnetContracts, "APE", "balanceOf", [address]);
  console.log("apeBalance:", getBalance)
  const getAllowance = useContractReader(mainnetContracts, "APE", "allowance",[address, "0x4d224452801ACEd8B2F0aebE155379bb5D594381"])
  const [allowance, setAllowance] = useState(0)
  const nfProofAddress = readContracts && readContracts.NFProof && readContracts.NFProof.address
  console.log("nfproofaddress:", nfProofAddress)
  //console.log("getAllowance:", getAllowance)
  const getAllowanceTest = useContractReader(readContracts, "ApeSample", "allowance", [address, nfProofAddress])
  const allowanceTest = getAllowanceTest && getAllowanceTest.toNumber && getAllowanceTest.toString()
  const [allowNum, setAllowNum] = useState(0)
  const allowNumber = getAllowanceTest && getAllowanceTest.toNumber &&  parseInt(utils.formatEther(allowanceTest))
  const proofToken = tokenToToken && tokenToToken.toNumber && tokenToToken.toNumber();
  const [approveLoading, setApproveLoading] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [dataRetrieval, setDataRetrieval] = useState(false)
  console.log("allowNumber", allowNumber)
  console.log("tokentotoken:", proofToken)
  console.log("tokenMintBool:", tokenMintBool)
  console.log("tokenPaidBool:", tokenPaidBool)

  

  const CardCompon = () => {

    return (
    
    <Card
    bordered
      hoverable
      style={{ width: 300}} 
      cover={
          <Image
          width={300}
          src={dataRetrieval && tokenMetadata && tokenMetadata.metadata.image? tokenMetadata.metadata.image : "error"}
          fallback="data:image/png;base64,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"
      />  
      }
      
    >
      <Typography.Paragraph><Typography.Text strong>Name:</Typography.Text> {dataRetrieval && tokenMetadata && tokenMetadata.contractMetadata ? tokenMetadata.contractMetadata.name :'error loading name'}</Typography.Paragraph>
      <Typography.Paragraph><Typography.Text strong>Token:</Typography.Text> {dataRetrieval && tokenMetadata ? tokenMetadata.id.tokenId:'error loading id'}</Typography.Paragraph>
      
    </Card>
    
    )}
  

  console.log("getAllowanceTest:", getAllowanceTest)

  const getMetadata = async() => {
    //need to switch this for mainnet prod
    const baseURL = `https://eth-goerli.g.alchemy.com/nft/v2/${process.env.REACT_APP_GOERLI_ALCHEMY_KEY}/getNFTMetadata`;
    const tokenType = "erc721";
    var config = {
        method: 'get',
        url: `${baseURL}?contractAddress=${search_contract}&tokenId=${search_token}&tokenType=${tokenType}`,
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

  useEffect(() => {
    
    if (tokenMintBool === true && tokenToToken.toNumber && proofToken) {
     history.push(`/viewproof/${proofToken}`) ;
    }

    const updateMetadata = async () => {    
    await getMetadata()
    tokenMetadata ? setDataRetrieval(true): console.log('no tokenMetadata yet')
    }

    dataRetrieval == false? updateMetadata():console.log('data already retrieved')

  }, [address, tokenToToken]);

  const handleEthMintClick = async() => {
    
        /* look how you call setPurpose on your contract: */
        /* notice how you pass a call back for tx updates too */
        const cost = utils.parseEther(".0001");
        setMintLoading(true)
        try{
        const result = tx(writeContracts.NFProof.safeMint(search_contract, search_token, {value: cost}), update => {
          
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
        
    } catch(e) {
        console.log(e)
        setMintLoading(false)
    }
    setMintLoading(false)
  }

  const handleFreeMintClick = async() => {
    /* look how you call setPurpose on your contract: */
    /* notice how you pass a call back for tx updates too */
    setMintLoading(true)
    try {
    const result = tx(writeContracts.NFProof.safeMint(search_contract, search_token), update => {
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
    
    } catch(e) {
        console.log(e)
    }
    
}
  const onTab1Change = (key) => {
    setActiveTabKey1(key);
  };

  const FreeMint = () => {
    return (
        <>
            <Typography.Paragraph style={{color:'#5a13e6'}}>Token Has Been Paid For. Mint for Free!</Typography.Paragraph>
            <br></br>
            <Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick = {handleFreeMintClick} loading={mintLoading}>Mint</Button>
        </>
    )
  }

  const tabList = [
    {
      key: 'tab1',
      tab: 'Mint',
    }
  ];
  const contentList = {

    tab1: <Row justify='center'>
          <Typography.Paragraph strong>Minting Costs <Typography.Text style={{color:'#5a13e6'}}>.0001 Eth</Typography.Text></Typography.Paragraph>
          <br></br>
          <Typography.Paragraph>After minting you can set any any of your wallets as the offical owner.</Typography.Paragraph>
          <br></br>
        {tokenPaidBool ?  <FreeMint /> :
          <Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick = {handleEthMintClick} loading={mintLoading}>Mint</Button>
        }
          </Row>
  };


  return (
    <Container>
        <Row justify="center">
        <Space direction="vertical">
            <Typography.Title
                            level={2} style ={{color: '#460fb3'}}
                        >Mint NFP Token</Typography.Title>
            
        </Space>  
        </Row>
    
    <Content>
      <Row align='middle' style ={{marginBottom:75}}>
        <Col xs={24} sm={24} md={12} lg={14} xl={14} style={{justifyContent:"center"}}>

           <Row justify='center'>
                    {dataRetrieval && tokenMetadata &&
                     <CardCompon />       
                    }
            </Row>     
          
        </Col>
        <Col xs={24} sm={24} md={12} lg={10} xl={10} style={{alignContent:'center'}}>
        <Card
            style={{ width: '90%'}}
            tabList={tabList}
            headStyle = {{color: ''}}
            activeTabKey={activeTabKey1}
            onTabChange={key => {
            onTab1Change(key);
            }}
            
            >
            {contentList[activeTabKey1]}
        </Card>
        </Col>
        </Row>

        
      </Content>
      

      <SvgDotPattern1 />
      
      
      <SvgDotPattern4 />
    </Container>
  );
}
