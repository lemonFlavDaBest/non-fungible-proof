

/*<Col span={6}>
    <Card title="Edit User" bordered={false}>
        <p>Give Proof of Ownersip to an address</p>
            <AddressInput
                ensProvider={mainnetProvider}
                placeholder="enter address"
                value={ownershipToAddresses[proofTokensId]}
                onChange={newValue => {
                    const update = {};
                    update[proofTokensId] = newValue;
                    setOwnershipToAddresses({ ...ownershipToAddresses, ...update });
                    }}
            />
        <p>When do you want this to expire?</p>
            <DatePicker
                style={{
                    width: '50%',
                    }}
                onChange ={onDateChange}
                />
            <Button
                onClick={() => {
                    console.log("writeContracts", writeContracts);
                    tx(writeContracts.NFProof.setUser(proofTokensId,  ownershipToAddresses[proofTokensId], expiryTime));
                    }}
                >
                    Set as Proof of Ownership
            </Button>

    </Card>
</Col>
*/
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Space, Switch, Image, Row, Col, Descriptions, Badge, Result} from "antd";
import React, { useState, useEffect } from "react";
import { utils, BigNumber } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { Address, Balance, Events, AddressInput, } from "../components";

/*
The idea is to
 view the NFT. 
give original contract & id.
is there a user? set User?
owner?
valid?
Burn?

*/

export default function EditProof({
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
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [nftCollection, setNFTCollection] = useState();
  const [originalTokenId, setOriginalTokenId] = useState();
  const {proof_id}= useParams();
  const ownerObject = useContractReader(readContracts, "NFProof", "_owners", [proof_id]);
  const userOfProof = useContractReader(readContracts, "NFProof", "userOf", [proof_id]);
  const validateOwner = useContractReader(readContracts, "NFProof", "isValidOwner", [proof_id]);
  const validateUser = useContractReader(readContracts, "NFProof", "isValidUserToken", [proof_id]);
  const ownerAddress = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.owner;
  const proofTokenId = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.proofTokenId.toNumber()
  const ownerOGContract = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalContract;
  const ownerOGToken = ownerObject && ownerObject.proofTokenId.toNumber && ownerObject.originalTokenId;
  console.log("wuzzDa", ownerObject && ownerObject.proofTokenId.toNumber);
  console.log("ownerObject:", ownerObject)
  console.log("ownerObjectArray?:", Array.isArray(ownerObject))
  const [userObject, setUserObject] = useState();
  const [ownershipToAddresses, setOwnershipToAddresses] = useState({});
  const [expiryTime, setExpiryTime] = useState()

  const onDateChange = (date, dateString) => {
    console.log(date, dateString);
    const reformDate = new Date(dateString);
    const timestampInSeconds = Math.floor(reformDate.getTime() / 1000);
    setExpiryTime(timestampInSeconds);
    console.log("UNIX TimeStamp:", timestampInSeconds);
    return timestampInSeconds;
  };

  useEffect(() => {
    const updateOwnerObject = async () => {
      console.log("ownerAddress:", ownerAddress)
      console.log("proof_id:", proof_id);
      const userResult = await readContracts.NFProof._users(proof_id);
      console.log("userResult:", userResult)
      setUserObject(userResult);
    }
    ownerAddress && updateOwnerObject();
  }, [address, ownerAddress])

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Owner Info:" bordered={false}>
            Owner's Address: <Address address = {ownerAddress && ownerAddress ? ownerAddress: null}  
            fontSize = {12}/>
            <br></br>
            Proof Owner: {userObject && userObject[0].user>0 ? <Address address = {userObject[0].user}  
            fontSize = {12}/>: "Set Proof Owner"}
            <br></br>
            Proof Token # {proof_id}
            
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Proof of NFT:" bordered={false}>
              Contract Address: 
              <br></br>
              <Address
                address={ownerAddress && ownerAddress ? ownerObject.originalContract : null}
                ensProvider={mainnetProvider}
                fontSize={8}
                />
                <br></br>
              Token Id: {ownerAddress && ownerAddress ? ownerObject.originalTokenId.toNumber() : null}
              <br></br>
            View on Etherscan
            </Card>
            <br></br>
            View on Etherscan
        </Col>
      </Row>
      <Row gutter={[16, 24]}>
        
        <Col span = {12}>
        <Image
          width={400}
          height={400}
          src="error"
          fallback="data:image/png;base64,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"
        />
        </Col>
        <Col span={12}>
    <Card title="Edit Owner" bordered={false}>
        <p>Give Proof of Ownersip to an address</p>
            <AddressInput
                ensProvider={mainnetProvider}
                placeholder="enter address"
                value={ownershipToAddresses[proofTokenId]}
                onChange={newValue => {
                    const update = {};
                    update[proofTokenId] = newValue;
                    setOwnershipToAddresses({ ...ownershipToAddresses, ...update });
                    }}
            />
        <p>When do you want this to expire?</p>
            <DatePicker
                style={{
                    width: '50%',
                    }}
                onChange ={onDateChange}
                />
            <Button
                onClick={() => {
                    console.log("writeContracts", writeContracts);
                    tx(writeContracts.NFProof.setUser(proofTokenId,  ownershipToAddresses[proofTokenId], expiryTime));
                    }}
                >
                    Set as Owner
            </Button>
            <br></br>
            <Button>
              Burn it!
            </Button>

    </Card>
</Col>
      </Row>
      </Space>
    
  );
}
