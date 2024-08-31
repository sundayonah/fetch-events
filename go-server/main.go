// package main

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"io/ioutil"
// 	"log"
// 	"math/big"
// 	"os"

// 	firebase "firebase.google.com/go"
// 	"github.com/ethereum/go-ethereum"
// 	"github.com/ethereum/go-ethereum/accounts/abi"
// 	"github.com/ethereum/go-ethereum/common"
// 	"github.com/ethereum/go-ethereum/core/types"
// 	"github.com/ethereum/go-ethereum/ethclient"
// 	"google.golang.org/api/option"
// )

// type PoolCreatedEvent struct {
// 	StartBlock    *big.Int
// 	EndBlock      *big.Int
// 	LeverageLong  *big.Int
// 	LeverageShort *big.Int
// 	Raw           types.Log
// }

// func loadABI(abiPath string) (*abi.ABI, error) {
// 	file, err := os.Open(abiPath)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer file.Close()

// 	byteValue, err := ioutil.ReadAll(file)
// 	if err != nil {
// 		return nil, err
// 	}

// 	var parsedABI abi.ABI
// 	if err := json.Unmarshal(byteValue, &parsedABI); err != nil {
// 		return nil, err
// 	}

// 	return &parsedABI, nil
// }

// func main() {
// 	// Load the ABI from the JSON file
// 	abiPath := "trades.json"
// 	contractABI, err := loadABI(abiPath)
// 	if err != nil {
// 		log.Fatalf("Failed to load contract ABI: %v", err)
// 	}

// 	// Connect to an Ethereum node
// 	client, err := ethclient.Dial("wss://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ")
// 	if err != nil {
// 		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
// 	}

// 	contractAddress := common.HexToAddress("0x57B5F08EE7Bf77b0118F3FB929B280A0E4FC3a19")

// 	// Firebase setup
// 	ctx := context.Background()
// 	sa := option.WithCredentialsFile("serviceAccountKey.json")
// 	app, err := firebase.NewApp(ctx, nil, sa)
// 	if err != nil {
// 		log.Fatalf("error initializing app: %v", err)
// 	}

// 	firestoreClient, err := app.Firestore(ctx)
// 	if err != nil {
// 		log.Fatalf("error initializing Firestore client: %v", err)
// 	}
// 	defer firestoreClient.Close()

// 	// Watch for PoolCreated events
// 	query := ethereum.FilterQuery{
// 		Addresses: []common.Address{contractAddress},
// 	}
// 	logs := make(chan types.Log)
// 	subscription, err := client.SubscribeFilterLogs(ctx, query, logs)
// 	if err != nil {
// 		log.Fatalf("Failed to subscribe to event: %v", err)
// 	}

// 	fmt.Println("Listening for PoolCreated events...")

// 	for {
// 		select {
// 		case err := <-subscription.Err():
// 			log.Fatalf("Error: %v", err)
// 		case vLog := <-logs:
// 			fmt.Printf("New Pool Created: %+v\n", vLog)

// 			// Decode the event
// 			var event PoolCreatedEvent

// 			err := contractABI.UnpackIntoInterface(&event, "PoolCreated", vLog.Data)
// 			if err != nil {
// 				log.Fatalf("Failed to unpack event data: %v", err)
// 			}

// 			// Extract the PoolId from the topics
// 			poolId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())

// 			startBlockInt := int64(0)
// 			if event.StartBlock != nil {
// 				startBlockInt = event.StartBlock.Int64()
// 			}
// 			endBlockInt := int64(0)
// 			if event.EndBlock != nil {
// 				endBlockInt = event.EndBlock.Int64()
// 			}
// 			leverageLongInt := int64(0)
// 			if event.LeverageLong != nil {
// 				leverageLongInt = event.LeverageLong.Int64()
// 			}
// 			leverageShortInt := int64(0)
// 			if event.LeverageShort != nil {
// 				leverageShortInt = event.LeverageShort.Int64()
// 			}

// 			// Send the pool data to Firebase
// 			_, _, err = firestoreClient.Collection("pools").Add(ctx, map[string]interface{}{
// 				"poolId":        poolId.Int64(),
// 				"startBlock":    startBlockInt,
// 				"endBlock":      endBlockInt,
// 				"leverageLong":  leverageLongInt,
// 				"leverageShort": leverageShortInt,
// 			})
// 			if err != nil {
// 				log.Fatalf("Failed to save pool to Firestore: %v", err)
// 			}
// 		}
// 	}
// }

// //    const PoolsPrice = async (priceId: string) => {
// //       const alchemyApiKey =
// //          'https://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ';
// //       const provider = new ethers.JsonRpcProvider(alchemyApiKey);
// //       console.log(provider);

// //       const poolPriceInstance = new ethers.Contract(
// //          priceOracleContractAddress,
// //          priceOracleAbi,
// //          provider
// //       );

// //       const poolPrice = await poolPriceInstance.pools(priceId);
// //       console.log('Raw price from contract:', poolPrice.toString());
// //    };

// package main

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"io/ioutil"
// 	"log"
// 	"math/big"
// 	"os"
// 	"strings"

// 	firebase "firebase.google.com/go"
// 	"github.com/ethereum/go-ethereum"
// 	"github.com/ethereum/go-ethereum/accounts/abi"
// 	"github.com/ethereum/go-ethereum/common"
// 	"github.com/ethereum/go-ethereum/core/types"
// 	"github.com/ethereum/go-ethereum/ethclient"
// 	"google.golang.org/api/option"
// )

// type PoolCreatedEvent struct {
// 	StartBlock    *big.Int
// 	EndBlock      *big.Int
// 	LeverageLong  *big.Int
// 	LeverageShort *big.Int
// 	Raw           types.Log
// }

// // type PriceUpdatedEvent struct {
// // 	latestPrice *big.Int
// // 	updateBlock *big.Int
// // 	Raw         types.Log
// // }

// func loadABI(abiPath string) (*abi.ABI, error) {
// 	file, err := os.Open(abiPath)
// 	if err != nil {
// 		return nil, err
// 	}
// 	defer file.Close()

// 	byteValue, err := ioutil.ReadAll(file)
// 	if err != nil {
// 		return nil, err
// 	}

// 	var parsedABI abi.ABI
// 	if err := json.Unmarshal(byteValue, &parsedABI); err != nil {
// 		return nil, err
// 	}

// 	return &parsedABI, nil
// }

// // ABI definition
// const priceABI = `[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"updateBlock","type":"uint256"}],"name":"PriceUpdated","type":"event"}]`

// type PriceUpdatedEvent struct {
// 	NewPrice    *big.Int `json:"newPrice"`
// 	UpdateBlock *big.Int `json:"updateBlock"`
// }

// func main() {
// 	// Load the ABIs from the JSON files
// 	poolABIPath := "trades.json"
// 	contractABI, err := loadABI(poolABIPath)
// 	if err != nil {
// 		log.Fatalf("Failed to load contract ABI: %v", err)
// 	}

// 	// priceABIPath := "priceOracleAbi.json"
// 	// priceABI, err := loadABI(priceABIPath)
// 	// if err != nil {
// 	// 	log.Fatalf("Failed to load price contract ABI: %v", err)
// 	// }

// 	// Parse the ABI
// 	priceABI, err := abi.JSON(strings.NewReader(priceABI))
// 	if err != nil {
// 		log.Fatalf("Failed to parse ABI: %v", err)
// 	}

// 	// Connect to an Ethereum node
// 	client, err := ethclient.Dial("wss://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ")
// 	if err != nil {
// 		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
// 	}

// 	poolContractAddress := common.HexToAddress("0x57B5F08EE7Bf77b0118F3FB929B280A0E4FC3a19")
// 	priceContractAddress := common.HexToAddress("0xcDC7cB917bE249A1ff5F623D5CF590eDA36236a7")

// 	// Firebase setup
// 	ctx := context.Background()
// 	sa := option.WithCredentialsFile("serviceAccountKey.json")
// 	app, err := firebase.NewApp(ctx, nil, sa)
// 	if err != nil {
// 		log.Fatalf("error initializing app: %v", err)
// 	}

// 	firestoreClient, err := app.Firestore(ctx)
// 	if err != nil {
// 		log.Fatalf("error initializing Firestore client: %v", err)
// 	}
// 	defer firestoreClient.Close()

// 	// Watch for PoolCreated and PriceUpdated events
// 	poolQuery := ethereum.FilterQuery{
// 		Addresses: []common.Address{poolContractAddress},
// 	}
// 	priceQuery := ethereum.FilterQuery{
// 		Addresses: []common.Address{priceContractAddress},
// 	}

// 	logs := make(chan types.Log)

// 	poolSubscription, err := client.SubscribeFilterLogs(ctx, poolQuery, logs)
// 	if err != nil {
// 		log.Fatalf("Failed to subscribe to pool event: %v", err)
// 	}

// 	priceSubscription, err := client.SubscribeFilterLogs(ctx, priceQuery, logs)
// 	if err != nil {
// 		log.Fatalf("Failed to subscribe to price event: %v", err)
// 	}

// 	fmt.Println("Listening for PoolCreated and PriceUpdated events...")

// 	for {
// 		select {
// 		case err := <-poolSubscription.Err():
// 			log.Fatalf("Pool subscription error: %v", err)
// 		case err := <-priceSubscription.Err():
// 			log.Fatalf("Price subscription error: %v", err)
// 		case vLog := <-logs:
// 			switch vLog.Address {
// 			case poolContractAddress:
// 				fmt.Printf("New Pool Created: %+v\n", vLog)

// 				var event PoolCreatedEvent
// 				err := contractABI.UnpackIntoInterface(&event, "PoolCreated", vLog.Data)
// 				if err != nil {
// 					log.Fatalf("Failed to unpack pool event data: %v", err)
// 				}

// 				poolId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())

// 				startBlockInt := int64(0)
// 				if event.StartBlock != nil {
// 					startBlockInt = event.StartBlock.Int64()
// 				}
// 				endBlockInt := int64(0)
// 				if event.EndBlock != nil {
// 					endBlockInt = event.EndBlock.Int64()
// 				}
// 				leverageLongInt := int64(0)
// 				if event.LeverageLong != nil {
// 					leverageLongInt = event.LeverageLong.Int64()
// 				}
// 				leverageShortInt := int64(0)
// 				if event.LeverageShort != nil {
// 					leverageShortInt = event.LeverageShort.Int64()
// 				}

// 				_, _, err = firestoreClient.Collection("pools").Add(ctx, map[string]interface{}{
// 					"poolId":        poolId.Int64(),
// 					"startBlock":    startBlockInt,
// 					"endBlock":      endBlockInt,
// 					"leverageLong":  leverageLongInt,
// 					"leverageShort": leverageShortInt,
// 				})
// 				if err != nil {
// 					log.Fatalf("Failed to save pool to Firestore: %v", err)
// 				}
// 			case priceContractAddress:
// 				fmt.Printf("Price Updated: %+v\n", vLog)

// 				var event PriceUpdatedEvent
// 				err := priceABI.UnpackIntoInterface(&event, "PriceUpdated", vLog.Data)
// 				if err != nil {
// 					log.Fatalf("Failed to unpack price event data: %v", err)
// 				}
// 				fmt.Print(event)
// 				priceInt := int64(0)
// 				if event.NewPrice != nil {
// 					priceInt = event.NewPrice.Int64()
// 				}

// 				blockNumberInt := int64(0)
// 				if event.UpdateBlock != nil {
// 					blockNumberInt = event.UpdateBlock.Int64()
// 				}

// 				_, _, err = firestoreClient.Collection("prices").Add(ctx, map[string]interface{}{
// 					"price":       priceInt,
// 					"blockNumber": blockNumberInt,
// 				})
// 				if err != nil {
// 					log.Fatalf("Failed to save price to Firestore: %v", err)
// 				}
// 			}
// 		}
// 	}
// }

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"google.golang.org/api/option"
)

type PoolCreatedEvent struct {
	StartBlock    *big.Int
	EndBlock      *big.Int
	LeverageLong  *big.Int
	LeverageShort *big.Int
	Raw           types.Log
}

type PriceUpdatedEvent struct {
	NewPrice    *big.Int `json:"newPrice"`
	UpdateBlock *big.Int `json:"updateBlock"`
}

func loadABI(abiPath string) (*abi.ABI, error) {
	file, err := os.Open(abiPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	byteValue, err := ioutil.ReadAll(file)
	if err != nil {
		return nil, err
	}

	var parsedABI abi.ABI
	if err := json.Unmarshal(byteValue, &parsedABI); err != nil {
		return nil, err
	}

	return &parsedABI, nil
}

const priceABI = `[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPrice","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"updateBlock","type":"uint256"}],"name":"PriceUpdated","type":"event"}]`

func main() {
	// Load the ABI for the pool contract
	poolABIPath := "trades.json"
	contractABI, err := loadABI(poolABIPath)
	if err != nil {
		log.Fatalf("Failed to load contract ABI: %v", err)
	}

	// Parse the ABI for the price contract
	priceABI, err := abi.JSON(strings.NewReader(priceABI))
	if err != nil {
		log.Fatalf("Failed to parse ABI: %v", err)
	}

	// Connect to an Ethereum node
	client, err := ethclient.Dial("wss://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ")
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	poolContractAddress := common.HexToAddress("0x57B5F08EE7Bf77b0118F3FB929B280A0E4FC3a19")
	priceContractAddress := common.HexToAddress("0xcDC7cB917bE249A1ff5F623D5CF590eDA36236a7")

	// Firebase setup
	ctx := context.Background()
	sa := option.WithCredentialsFile("serviceAccountKey.json")
	app, err := firebase.NewApp(ctx, nil, sa)
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	firestoreClient, err := app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error initializing Firestore client: %v", err)
	}
	defer firestoreClient.Close()

	// Watch for PoolCreated and PriceUpdated events
	poolQuery := ethereum.FilterQuery{
		Addresses: []common.Address{poolContractAddress},
	}
	priceQuery := ethereum.FilterQuery{
		Addresses: []common.Address{priceContractAddress},
	}

	logs := make(chan types.Log)

	poolSubscription, err := client.SubscribeFilterLogs(ctx, poolQuery, logs)
	if err != nil {
		log.Fatalf("Failed to subscribe to pool event: %v", err)
	}

	priceSubscription, err := client.SubscribeFilterLogs(ctx, priceQuery, logs)
	if err != nil {
		log.Fatalf("Failed to subscribe to price event: %v", err)
	}

	fmt.Println("Listening for PoolCreated and PriceUpdated events...")

	for {
		select {
		case err := <-poolSubscription.Err():
			log.Fatalf("Pool subscription error: %v", err)
		case err := <-priceSubscription.Err():
			log.Fatalf("Price subscription error: %v", err)
		case vLog := <-logs:
			switch vLog.Address {
			case poolContractAddress:
				fmt.Printf("New Pool Created: %+v\n", vLog)

				var event PoolCreatedEvent
				err := contractABI.UnpackIntoInterface(&event, "PoolCreated", vLog.Data)
				if err != nil {
					log.Fatalf("Failed to unpack pool event data: %v", err)
				}

				poolId := new(big.Int).SetBytes(vLog.Topics[1].Bytes())

				startBlockInt := int64(0)
				if event.StartBlock != nil {
					startBlockInt = event.StartBlock.Int64()
				}
				endBlockInt := int64(0)
				if event.EndBlock != nil {
					endBlockInt = event.EndBlock.Int64()
				}
				leverageLongInt := int64(0)
				if event.LeverageLong != nil {
					leverageLongInt = event.LeverageLong.Int64()
				}
				leverageShortInt := int64(0)
				if event.LeverageShort != nil {
					leverageShortInt = event.LeverageShort.Int64()
				}

				_, _, err = firestoreClient.Collection("pools").Add(ctx, map[string]interface{}{
					"poolId":        poolId.Int64(),
					"startBlock":    startBlockInt,
					"endBlock":      endBlockInt,
					"leverageLong":  leverageLongInt,
					"leverageShort": leverageShortInt,
				})
				if err != nil {
					log.Fatalf("Failed to save pool to Firestore: %v", err)
				}
			case priceContractAddress:
				fmt.Printf("Price Updated: %+v\n", vLog)

				var event PriceUpdatedEvent
				err := priceABI.UnpackIntoInterface(&event, "PriceUpdated", vLog.Data)
				if err != nil {
					log.Fatalf("Failed to unpack price event data: %v", err)
				}
				fmt.Printf("Event Details: %+v\n", event)

				priceInt := int64(0)
				if event.NewPrice != nil {
					priceInt = event.NewPrice.Int64()
				}

				blockNumberInt := int64(0)
				if event.UpdateBlock != nil {
					blockNumberInt = event.UpdateBlock.Int64()
				}

				_, _, err = firestoreClient.Collection("prices").Add(ctx, map[string]interface{}{
					"price":       priceInt,
					"blockNumber": blockNumberInt,
				})
				if err != nil {
					log.Fatalf("Failed to save price to Firestore: %v", err)
				}
			}
		}
	}
}
