
import { Typography, Button, Card, DatePicker, Divider, Input, Progress, Slider, Space, Switch, Image, Row, Col, Descriptions, Badge, Result} from "antd";
import React, { useState, useEffect, useCallback } from "react";
import tw from "twin.macro";
import { ReactComponent as SvgDecoratorBlob1 } from "../images/svg-decorator-blob-4.svg";
import { ReactComponent as SvgDecoratorBlob2 } from "../images/svg-decorator-blob-5.svg";
import { utils, BigNumber } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { useParams, Link, useHistory } from "react-router-dom";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { Address, Balance, Events, AddressInput, } from "../components";
import { parseEther } from "ethers/lib/utils";
import axios from 'axios'

export default function BurnProof({
  address,
  mainnetProvider,
  localProvider,
  tx,
  readContracts,
  writeContracts,
}) {
  const Container = tw.div`relative`;
  const Content = tw.div`max-w-screen-xl mx-auto py-8 lg:py-8`;
  let history = useHistory()
  const {proof_id}= useParams();
  const ownerObject = useContractReader(readContracts, "NFProof", "_owners", [proof_id]);
  const userOfProof = useContractReader(readContracts, "NFProof", "userOf", [proof_id]);
  //const validateOwner = useContractReader(readContracts, "NFProof", "isValidOwner", [proof_id]);
  //const validateUser = useContractReader(readContracts, "NFProof", "isValidUserToken", [proof_id]);
  const ownerAddress = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.owner;
  const nftCollection = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalContract
  const originalTokenId = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalTokenId
  const proofTokenId = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.proofTokenId.toNumber()
  console.log("wuzzDa", ownerObject && ownerObject.proofTokenId.toNumber);
  console.log("ownerObject:", ownerObject)
  console.log("ownerObjectArray?:", Array.isArray(ownerObject))
  const [userObject, setUserObject] = useState();
  const {Text, Paragraph} = Typography;
  const [dataRetrieval, setDataRetrieval] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const ownerOGContract = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalContract;
  const ownerOGToken = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalTokenId;
  const [isNFPOwner, setIsNFPOwner] = useState(false);
  const [loadingState, setLoadingState] = useState(false)

  const DecoratorBlob1 = tw(
    SvgDecoratorBlob1
  )`absolute w-32 top-0 left-0 -z-10 text-primary-500 opacity-25 transform -translate-x-full`;
  const DecoratorBlob2 = tw(
    SvgDecoratorBlob2
  )`absolute w-32 bottom-0 right-0 -z-10 text-pink-500 opacity-15 transform translate-x-2/3 translate-y-8`;

  const handleClick = async() => {
    if (window.confirm("Are you sure? you can always mint another :)")){
    const cost = parseEther(".0000001")
    console.log(nftCollection, originalTokenId,proofTokenId, cost)
    setLoadingState(true)
    try {
    const result = tx(writeContracts.TheBurn.burner(nftCollection, originalTokenId, proofTokenId, {value: cost}), update => {
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
    history.push('/searchnft')
    } catch(e) {
      console.log(e)
      setLoadingState(false)
    }
    
    }
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

  useEffect(() => {
    const updateOwnerObject = async () => {
      console.log("ownerAddress:", ownerAddress)
      console.log("proof_id:", proof_id);
      const userResult = await readContracts.NFProof._users(proof_id);
      console.log("userResult:", userResult)
      setUserObject(userResult);
      await getMetadata();
      tokenMetadata ? setDataRetrieval(true): console.log('no tokenMetadata yet')
      ownerAddress === address ? setIsNFPOwner(true) : setIsNFPOwner(false);
    }
    ownerAddress && updateOwnerObject();
  }, [address, ownerAddress, getMetadata])

  return (
    <Container>
    <Content>
    
      <Row justify='center'>
     
            <Typography.Title
                            level={2} style ={{color: '#460fb3'}}
                        >NFP Token Burner</Typography.Title>
            
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Owner Info:" bordered={false}>
          <Paragraph><Text style ={{color: '#3c0d99'}} strong>Owner:</Text> <Address address = {ownerAddress && ownerAddress ? ownerAddress: null}  
              fontSize = {12}/></Paragraph>
              
              <Paragraph><Text style ={{color: '#3c0d99'}} strong>Owner's Wallet:</Text> {userObject && userObject.expires > 0 ? <Address address = {userOfProof}  
              fontSize = {12}/>: <Text disabled>No Wallet</Text>} </Paragraph>
              
              <Paragraph><Text style ={{color: '#3c0d99'}} strong>NFP Token:</Text> #{proof_id}</Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Proof of NFT:" bordered={false}>
          <Text style ={{color: '#3c0d99'}} strong>Token: </Text>{dataRetrieval && tokenMetadata.contractMetadata.name}
                <br></br>
              <Text style ={{color: '#3c0d99'}} strong>Token Id:</Text> #{ownerAddress && ownerAddress ? ownerObject.originalTokenId.toNumber() : null}
              <br></br>
              <Text style ={{color: '#3c0d99'}} strong>Contract:</Text> <Address
                address={ownerAddress && ownerAddress ? ownerObject.originalContract : null}
                ensProvider={mainnetProvider}
                fontSize={6}
                />
              <br></br>
              <a style ={{color: '#434190'}} href={`https://etherscan.io/token/${ownerOGContract}`}>View on Etherscan</a>
            </Card>
            
        </Col>
      </Row>
      <Row gutter={[16, 24]}>
        
        <Col span = {12}>
        <Image
            width={400}
            height={400}
            src={ownerAddress && tokenMetadata ? tokenMetadata.metadata.image : "error"}
            fallback="data:image/png;base64,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"
            />  
        </Col>
        <Col span={12}>
        <Row justify= 'center'>
        <Card bordered={true}>
            <>
            Burning this token <Text strong>will not </Text> burn the underlying asset.
            
            You can always mint another NFP after burning it.
            <Divider />
            <Text type='secondary'>Burning will cost a small fee (.000000001 ether) to avoid spam.</Text>
            <Divider />
            <Row justify= 'center'>
            {
              isNFPOwner?
            <Button type="primary" danger onClick={handleClick} loading={loadingState}>BURN</Button>:
            <Button type="primary" danger disabled>BURN</Button>
            
            }
            </Row>
            </>
        </Card>
      </Row>
      </Col>
      </Row>
            
      
      </Content>
      <DecoratorBlob1 />
      <DecoratorBlob2 />

      </Container>

      
    
  );
}
