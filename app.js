const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors({ origin: '*' })); 

app.get('/getTokenDetails', async (req, res) => {
  try {
    // Assuming you receive tokenAddress from the React app as a query parameter
    const tokenAddress = req.query.tokenAddress;
    const headers = {
      'X-QKNTL-KEY': '02eb21a1cc4c49ecb34a9f074fdeebe8',
    };
    // Make the POST request to the external API
    const response = await axios.post('https://api.quickintel.io/v1/getquickiauditfull', {
      chain: 'eth', // 'eth' is hardcoded based on your requirements
      tokenAddress: tokenAddress,
    }, {headers});

    //console.log(response);
    // Extract the required information from the response
    const {
      tokenDetails: { tokenName, tokenSymbol, tokenOwner, tokenSupply },
      tokenDynamicDetails: { is_Honeypot, lp_Locks },
    } = response.data;

    // Construct the object to be returned
    const result = {
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      tokenOwner: tokenOwner,
      tokenSupply: tokenSupply,
      isHoneypot: is_Honeypot,
      lpLocks: lp_Locks !== null ? lp_Locks : "Burned",
    };

    // console.log(result);
    // Send the result back to the React app
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getTokenEvents', async (req, res) => {
  try {
    // Make the GET request to the CoinMarketCal API
    const response = await axios.get('https://developers.coinmarketcal.com/v1/events', {
      headers: {
        'x-api-key': 'CO9FGdFk1s3vS3PuPY4XV5tJU43PBeuC8V5QUBqx',
        'Accept-Encoding': 'deflate, gzip',
        'Accept': 'application/json',
      },
    });

    // Extract the top 6 events from the response
    const top5Events = response.data.body.slice(0, 4).map(event => ({
      title: event.title.en,
      fullname: event.coins[0].fullname,
    }));

    // Send the top 5 events back to the React app
    res.json(top5Events);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint for getting top gainers
app.get('/getTopGainers', async (req, res) => {
  try {
    // Make the POST request to the Defined.fi GraphQL API
    const response = await axios.post(
      'https://graph.defined.fi/graphql',
      {
        query: `
          {
            listTopTokens(limit: 10, networkFilter: 1, resolution: "1D") {
              address
              decimals
              exchanges {
                address
                id
                name
                iconUrl
                networkId
                tradeUrl
              }
              id
              liquidity
              name
              networkId
              price
              priceChange
              priceChange1
              priceChange4
              priceChange12
              priceChange24
              resolution
              symbol
              topPairId
              volume
            }
          }
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: '7b7401b9f6ca72eeb7fd977c113dc0dd20b1c034',
        },
      }
    );

    // Extract relevant data from the response
    const topGainers = response.data.data.listTopTokens.map(token => ({
      name: token.name,
      symbol: token.symbol,
      price: token.price,
      priceChange: token.priceChange,
      priceChange1: token.priceChange1,
      priceChange4: token.priceChange4,
      priceChange12: token.priceChange12,
      priceChange24: token.priceChange24,
      volume: token.volume,
    }));

    // Send the top gainers back to the React app
    res.json(topGainers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getLatestTokens', async (req, res) => {
  try {
    // Make the POST request to the Defined.fi GraphQL API
    const response = await axios.post(
      'https://graph.defined.fi/graphql',
      {
        query: `
          {
            getLatestTokens(limit: 5, networkFilter: 1) {
              items {
                id
                tokenAddress
                networkId
                blockNumber
                transactionIndex
                traceIndex
                transactionHash
                blockHash
                timeCreated
                creatorAddress
                creatorBalance
                tokenName
                totalSupply
                tokenSymbol
                decimals
                simulationResults {
                  buySuccess
                  buyTax
                  buyGasUsed
                  sellSuccess
                  sellTax
                  sellGasUsed
                  canTransferOwnership
                  canRenounceOwnership
                  isOwnerRenounced
                  openTradingCall
                }
              }
            }
          }
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: '57efd78a3f4001cdd24b36f13358e407e86e4f22',
        },
      }
    );

    //console.log(response.data)

    // // Extract relevant data from the response
    // const latestTokens = response.data.data.getLatestTokens.items.map(token => ({
    //   id: token.id,
    //   tokenAddress: token.tokenAddress,
    //   networkId: token.networkId,
    //   blockNumber: token.blockNumber,
    //   transactionIndex: token.transactionIndex,
    //   // ... (add more fields as needed)
    // }));

    // Send the latest tokens back to the React app
    res.json(latestTokens);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
