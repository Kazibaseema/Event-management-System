// App.js - Updated with ticket verification
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import CreateEvent from './components/CreateEvent';
import EventList from './components/EventList';
import BuyTicket from './components/BuyTicket';
import TransferTicket from './components/TransferTicket';
import MyTickets from './components/MyTickets';
import TicketVerification from './components/TicketVerification';

// ABI will be imported from the compiled contract
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			}
		],
		"name": "buyTicket",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketCount",
				"type": "uint256"
			}
		],
		"name": "createEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "transferTicket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "address",
				"name": "organizer",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "date",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketRemain",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tickets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [events, setEvents] = useState([]);
  const [nextId, setNextId] = useState(0);
  const [activeTab, setActiveTab] = useState('events');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Contract address - you'll need to replace this with your deployed contract address
  const contractAddress = '0x9faE135f9311d210fD7Dc1071b7057c1B712E1a3';  // Default Hardhat first account
  
  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          // Connect to MetaMask
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          
          setProvider(provider);
          setContract(contract);
          setAccount(account);
          
          // Get the next event ID to know how many events exist
          const nextEventId = await contract.nextId();
          setNextId(nextEventId.toNumber());
          
          // Load events data
          await loadEvents(nextEventId.toNumber(), contract);
          
          // Set up event listener for account changes
          window.ethereum.on('accountsChanged', async (accounts) => {
            setAccount(accounts[0]);
          });
          
          setLoading(false);
        } else {
          setError('MetaMask is not installed. Please install MetaMask to use this application.');
          setLoading(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError('Failed to initialize the application. Please make sure MetaMask is connected.');
        setLoading(false);
      }
    };
    
    init();
    
    return () => {
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);
  
  const loadEvents = async (nextId, contract) => {
    try {
      const eventsList = [];
      
      // Loop through all events based on the next ID
      for (let i = 0; i < nextId; i++) {
        const event = await contract.events(i);
        
        // Format the event data
        const eventData = {
          id: i,
          organizer: event.organizer,
          name: event.name,
          date: event.date.toNumber(),
          price: ethers.utils.formatEther(event.price),
          priceWei: event.price,
          ticketCount: event.ticketCount.toNumber(),
          ticketRemain: event.ticketRemain.toNumber()
        };
        
        eventsList.push(eventData);
      }
      
      setEvents(eventsList);
    } catch (err) {
      console.error("Error loading events:", err);
      setError('Failed to load events from the contract.');
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const refreshEvents = async () => {
    if (contract) {
      const nextEventId = await contract.nextId();
      setNextId(nextEventId.toNumber());
      await loadEvents(nextEventId.toNumber(), contract);
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };
  
  if (loading) {
    return <div className="loading">Loading application...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>..YOLO Consertzz..</h1>
        
        <div className="account-info">
          <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
          <button onClick={refreshPage}>Refresh App</button>
        </div>
      </header>
      
      <nav className="tabs">
        <button 
          className={activeTab === 'events' ? 'active' : ''} 
          onClick={() => handleTabChange('events')}
        >
          Browse Events
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''} 
          onClick={() => handleTabChange('create')}
        >
          Create Event
        </button>
        <button 
          className={activeTab === 'buy' ? 'active' : ''} 
          onClick={() => handleTabChange('buy')}
        >
          Buy Tickets
        </button>
        <button 
          className={activeTab === 'mytickets' ? 'active' : ''} 
          onClick={() => handleTabChange('mytickets')}
        >
          My Tickets
        </button>
        <button 
          className={activeTab === 'verify' ? 'active' : ''} 
          onClick={() => handleTabChange('verify')}
        >
          Verify Tickets
        </button>
        <button 
          className={activeTab === 'transfer' ? 'active' : ''} 
          onClick={() => handleTabChange('transfer')}
        >
          Transfer Tickets
        </button>
      </nav>
      
      <main className="content">
        {activeTab === 'events' && (
          <EventList events={events} refreshEvents={refreshEvents} />
        )}
        
        {activeTab === 'create' && (
          <CreateEvent 
            contract={contract} 
            account={account}
            refreshEvents={refreshEvents}
          />
        )}
        
        {activeTab === 'buy' && (
          <BuyTicket
            contract={contract}
            events={events}
            refreshEvents={refreshEvents}
          />
        )}
        
        {activeTab === 'mytickets' && (
          <MyTickets
            contract={contract}
            account={account}
            events={events}
          />
        )}
        
        {activeTab === 'verify' && (
          <TicketVerification
            contract={contract}
            events={events}
          />
        )}
        
        {activeTab === 'transfer' && (
          <TransferTicket
            contract={contract}
            account={account}
            events={events}
            refreshEvents={refreshEvents}
          />
        )}
      </main>
    </div>
  );
}

export default App;