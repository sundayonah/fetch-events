package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"os"
	"strconv"

	firebase "firebase.google.com/go"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"google.golang.org/api/option"
)

type TradeCreatedEvent struct {
	Trader     common.Address
	Platform   string
	EntryPrice int64
	Direction  string
	Duration   int64
	Move       int64
	Raw        types.Log // Blockchain-specific contextual information
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

func main() {
	// Load the ABI from the JSON file
	abiPath := "trades.json"
	contractABI, err := loadABI(abiPath)
	if err != nil {
		log.Fatalf("Failed to load contract ABI: %v", err)
	}

	// Connect to an Ethereum node
	client, err := ethclient.Dial("wss://eth-sepolia.g.alchemy.com/v2/k876etRLMsoIcTpTzkkTuh3LPBTK96YZ")
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	contractAddress := common.HexToAddress("0x652a6F034bA3aEfF9BDCF2Dd1348299a6E39a1dE")

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

	// Watch for TradeCreated events
	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
	}
	logs := make(chan types.Log)
	subscription, err := client.SubscribeFilterLogs(ctx, query, logs)
	if err != nil {
		log.Fatalf("Failed to subscribe to event: %v", err)
	}

	fmt.Println("Listening for TradeCreated events...")

	for {
		select {
		case err := <-subscription.Err():
			log.Fatalf("Error: %v", err)
		case vLog := <-logs:
			fmt.Printf("New Trade Created: %+v\n", vLog)

			// Decode the event
			var event struct {
				Trader     common.Address
				Platform   string
				EntryPrice *big.Int
				Direction  string
				Duration   *big.Int
				Move       *big.Int
			}

			err := contractABI.UnpackIntoInterface(&event, "TradeCreated", vLog.Data)
			if err != nil {
				log.Fatalf("Failed to unpack event data: %v", err)
			}

			// Convert values to strings for Firestore
			entryPriceStr := event.EntryPrice.String()
			durationStr := event.Duration.String()
			moveStr := event.Move.String()

			// Send the trade to Firebase
			_, _, err = firestoreClient.Collection("trades").Add(ctx, map[string]interface{}{
				"trader":     event.Trader.Hex(),
				"platform":   event.Platform,
				"entryPrice": entryPriceStr,
				"direction":  event.Direction,
				"duration":   durationStr,
				"move":       moveStr,
				"timestamp":  strconv.FormatUint(vLog.BlockNumber, 10), // Convert BlockNumber to string
			})
			if err != nil {
				log.Fatalf("Failed to save trade to Firestore: %v", err)
			}
		}
	}
}
