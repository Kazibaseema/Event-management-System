// components/TransferTicket.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function TransferTicket({ contract, account, events, refreshEvents }) {
  const [userAddress, setUserAddress] = useState('');
  const [eventId, setEventId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [useConnectedWallet, setUseConnectedWallet] = useState(true);
  const [userOwnedTickets, setUserOwnedTickets] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddressToggle = () => {
    setUseConnectedWallet(!useConnectedWallet);
    if (useConnectedWallet) {
      setUserAddress('');
      setUserOwnedTickets(0);
    } else {
      setUserAddress(account);
      loadUserTickets(account, eventId);
    }
  };

  const handleEventChange = async (e) => {
    const id = e.target.value;
    setEventId(id);
    
    if (id !== '') {
      const event = events.find(event => event.id.toString() === id);
      setSelectedEvent(event);
      
      // Load ticket count for selected address
      const address = useConnectedWallet ? account : userAddress;
      if (address && ethers.utils.isAddress(address)) {
        await loadUserTickets(address, id);
      }
    } else {
      setSelectedEvent(null);
      setUserOwnedTickets(0);
    }
  };

  const handleAddressChange = async (e) => {
    const address = e.target.value;
    setUserAddress(address);
    
    if (address && ethers.utils.isAddress(address) && eventId) {
      await loadUserTickets(address, eventId);
    } else {
      setUserOwnedTickets(0);
    }
  };

  const loadUserTickets = async (address, eventId) => {
    if (!contract || !address || !eventId || !ethers.utils.isAddress(address)) return;
    
    try {
      const ticketCount = await contract.tickets(address, eventId);
      setUserOwnedTickets(ticketCount.toNumber());
    } catch (err) {
      console.error('Error loading tickets:', err);
      setUserOwnedTickets(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      if (!selectedEvent) {
        throw new Error('Please select a valid event');
      }

      if (!ethers.utils.isAddress(recipient)) {
        throw new Error('Please enter a valid recipient Ethereum address');
      }

      const transferAddress = useConnectedWallet ? account : userAddress;
      
      if (!useConnectedWallet && !ethers.utils.isAddress(transferAddress)) {
        throw new Error('Please enter a valid sender Ethereum address');
      }

      if (useConnectedWallet) {
        // Connected wallet is transferring tickets
        const tx = await contract.transferTicket(eventId, quantity, recipient);
        await tx.wait();
        setMessage(`Successfully transferred ${quantity} ticket(s) to ${recipient}!`);
      } else {
        // Need to connect with the specified wallet
        setMessage(`For security reasons, the owner (${userAddress}) must connect their wallet and initiate the transfer themselves.`);
        return;
      }
      
      refreshEvents();
      
      // Reset form
      setQuantity(1);
      setRecipient('');
    } catch (err) {
      console.error('Error transferring tickets:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="transfer-ticket">
      <h2>Transfer Tickets</h2>
      
      <div className="toggle-container">
        <button 
          type="button" 
          className={useConnectedWallet ? 'toggle-button active' : 'toggle-button'}
          onClick={handleAddressToggle}
        >
          Use my connected wallet
        </button>
        <button 
          type="button" 
          className={!useConnectedWallet ? 'toggle-button active' : 'toggle-button'}
          onClick={handleAddressToggle}
        >
          Specify wallet address
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {!useConnectedWallet && (
          <div className="form-group">
            <label htmlFor="userAddress">Sender Wallet Address:</label>
            <input
              type="text"
              id="userAddress"
              value={userAddress}
              onChange={handleAddressChange}
              placeholder="0x..."
              required={!useConnectedWallet}
            />
            <small>Enter the Ethereum address that owns the tickets</small>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="eventId">Select Event:</label>
          <select
            id="eventId"
            value={eventId}
            onChange={handleEventChange}
            required
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {formatDate(event.date)}
              </option>
            ))}
          </select>
        </div>
        
        {selectedEvent && (
          <div className="event-details">
            <h3>Event Details</h3>
            <p><strong>Name:</strong> {selectedEvent.name}</p>
            <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
            <p><strong>Available tickets:</strong> {useConnectedWallet ? 'Loading...' : userOwnedTickets}</p>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="quantity">Number of Tickets to Transfer:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            max={userOwnedTickets}
            required
            disabled={!selectedEvent}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="recipient">Recipient Address:</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
            disabled={!selectedEvent}
          />
          <small>Enter the Ethereum address of the person who will receive the tickets</small>
        </div>
        
        <button 
          type="submit" 
          disabled={
            isLoading || 
            !selectedEvent || 
            !recipient || 
            quantity > userOwnedTickets || 
            (!useConnectedWallet && !ethers.utils.isAddress(userAddress))
          }
        >
          {isLoading ? 'Processing...' : 'Transfer Tickets'}
        </button>
      </form>
      
      {message && (
        <div className={message.includes('Error') ? 'message error' : 'message'}>
          {message}
        </div>
      )}
    </div>
  );
}

export default TransferTicket;