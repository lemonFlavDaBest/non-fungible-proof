/*import fetch from 'node-fetch';

  

  fetch(fetchURL, requestOptions)
    .then(response => response.json())
    .then(response => JSON.stringify(response, null, 2))
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

const getMetadata = async() => {
    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
    
    const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${GOERLI_ALCHEMY_KEY}/getNFTMetadata`;
    const contractAddr = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
    const tokenId = "2";
    const tokenType = "erc721";
    const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}&tokenType=${tokenType}`;

    try{
    const response = await fetch(fetchURL, requestOptions)
    const data = JSON.stringify(response, null, 2)
    return data
    } catch(e) {
        console.log(e)
    }
}
*/