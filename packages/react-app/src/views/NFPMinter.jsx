import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, List, Row, Col, Image, Space, Typography } from "antd";
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
  const [tokenPaid, setTokenPaid] = useState(null)
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
      
    </Card>)}
  

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

    const updateProofCollectibles = async () => {
    await getMetadata()
    tokenMetadata ? setDataRetrieval(true): console.log('no tokenMetadata yet')
    
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

  }, [address, tokenPaid, allowNumber, tokenMintBool, tokenToToken]);

  /*async function onMint() {
     //look how you call setPurpose on your contract: 
     //notice how you pass a call back for tx updates too 
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
          
  }*/

  const handleEthMintClick = async() => {
    
        /* look how you call setPurpose on your contract: */
        /* notice how you pass a call back for tx updates too */
        const cost = utils.parseEther(".001");
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
            <Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick = {handleFreeMintClick} loading={mintLoading}>Mint</Button>
        </>
    )
  }


  const ApproveApe = () => {
    return (<Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick = {handleApproveClick} loading={approveLoading}>Approve</Button>)
  }

  const PayWithApe = () => {
    
    return ( 
            <Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick={handleApePay} loading={payLoading}>1 $APE</Button>
    )
  }

  const tabList = [
    {
      key: 'tab1',
      tab: 'Mint',
    },
    {
      key: 'tab2',
      tab: 'w/ $APE',
    },
  ];
  const contentList = {

    tab1: <>
          <Typography.Paragraph strong>Minting Costs <Typography.Text style={{color:'#5a13e6'}}>.001 Eth</Typography.Text></Typography.Paragraph>
          <br></br>
          <Typography.Paragraph>After minting you can set any any of your wallets as the offical owner.</Typography.Paragraph>
          <br></br>
        {tokenPaidBool ?  <FreeMint /> :
          <Button type= "link" style={{backgroundColor: '#805ad5', color:'white'}} onClick = {handleEthMintClick}>Mint</Button>
        }
          </>
    ,
    tab2: <>
            <Typography.Paragraph strong>Minting Costs <Typography.Text style={{color:'#5a13e6'}}>1 $APE</Typography.Text></Typography.Paragraph>
            <br></br>
            <Typography.Paragraph>After minting you can set any any of your wallets as the offical owner.</Typography.Paragraph>
            <br></br>
            {tokenPaidBool ? <FreeMint />: allowNumber >= 1||allowNum>=1  ? <PayWithApe />:<ApproveApe />  }
            </>,
  };

    const handleApproveClick = async() => {
        const cost = utils.parseEther("1")
        setApproveLoading(true)
        //approve this address for the contract
        try{
        const result = tx(writeContracts.ApeSample.approve(nfProofAddress, cost), update => {
            setApproveLoading(true)
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
          setAllowNum(1)
        } catch(e) {
            console.log(e)
            setApproveLoading(false)
        }
    }

    const handleApePay = async() => {
        setPayLoading(true)
        const cost = utils.parseEther("1");
        try {
              const result = tx(writeContracts.NFProof.payWithERC(cost, search_contract, [search_token]), update => {
                
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
              setTokenPaid(true)
            } catch(e) {
              console.log(e)
              setPayLoading(false)
              setTokenPaid(false)
            }
    }


    /*
    const getTokenPaidBool = async() => {
       const tokenPaidBool =  await readContracts.NFProof.tokenHasBeenPaidFor(search_contract, seardch_token)
    }*/

    

  return (
    <div>
    <br></br>
    
      <Row justify = 'center' align = 'middle'>
        <Col span = {14}>
        
        <Space direction='vertical' wrap>
                    {dataRetrieval && tokenMetadata &&
                     <CardCompon />       
                    }
                    </Space>
          
        </Col>
        <Col span = {10}>
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
    
        <Row>
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
                        <Link to = {`/viewproof/${id}`}>View Token</Link>
                        <br></br>
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
            </Row>
        
    </div>
  );
}
