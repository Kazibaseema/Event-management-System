// components/BuyTicket.js
import React, { useState } from 'react';
import { ethers } from 'ethers';

function BuyTicket({ contract, events, refreshEvents }) {
  const [eventId, setEventId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventChange = (e) => {
    const id = e.target.value;
    setEventId(id);
    if (id !== '') {
      const event = events.find(event => event.id.toString() === id);
      setSelectedEvent(event);
    } else {
      setSelectedEvent(null);
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value));
  };

  const toggleAddressMode = () => {
    setUseCustomAddress(!useCustomAddress);
    setRecipientAddress('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      if (!selectedEvent) {
        throw new Error('Please select a valid event');
      }

      // Check if using custom address and validate it
      if (useCustomAddress && !ethers.utils.isAddress(recipientAddress)) {
        throw new Error('Please enter a valid Ethereum address');
      }

      const totalPrice = ethers.utils.parseEther(
        (parseFloat(selectedEvent.price) * quantity).toString()
      );

      // If using custom address, we'll use the contract's connected signer
      // to buy tickets on behalf of another address
      if (useCustomAddress) {
        // We need to create a custom transaction to buy tickets for another address
        // This requires a different approach as the contract doesn't have a direct 
        // method to buy tickets for others
        
        // Get signer from provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Buy ticket transaction from connected wallet
        const tx = await contract.buyTicket(eventId, quantity, {
          value: totalPrice
        });
        
        // Wait for transaction confirmation
        await tx.wait();
        
        // After purchase, transfer the tickets to the recipient address
        const transferTx = await contract.transferTicket(eventId, quantity, recipientAddress);
        await transferTx.wait();
        
        setMessage(`Successfully purchased ${quantity} ticket(s) for address ${recipientAddress}!`);
      } else {
        // Standard purchase for connected wallet
        const tx = await contract.buyTicket(eventId, quantity, {
          value: totalPrice
        });
        
        // Wait for transaction confirmation
        await tx.wait();
        
        setMessage(`Successfully purchased ${quantity} ticket(s)!`);
      }
      
      refreshEvents();
    } catch (err) {
      console.error('Error buying tickets:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateTotalPrice = () => {
    if (selectedEvent) {
      return (parseFloat(selectedEvent.price) * quantity).toFixed(4);
    }
    return '0';
  };

  return (
    <div className="buy-ticket">
      <h2>Buy Event Tickets</h2>
      
      <div className="toggle-container">
        <button 
          type="button" 
          className={!useCustomAddress ? 'toggle-button active' : 'toggle-button'}
          onClick={toggleAddressMode}
        >
          Buy for myself
        </button>
        <button 
          type="button" 
          className={useCustomAddress ? 'toggle-button active' : 'toggle-button'}
          onClick={toggleAddressMode}
        >
          Buy for someone else
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="eventId">Select Event:</label>
          <select
            id="eventId"
            value={eventId}
            onChange={handleEventChange}
            required
          >
            <option value="">-- Select an event --</option>
            {events.filter(event => event.ticketRemain > 0).map((event) => (
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
            <p><strong>Price per ticket:</strong> {selectedEvent.price} ETH</p>
            <p><strong>Available tickets:</strong> {selectedEvent.ticketRemain}</p>
          </div>
        )}
        
        {useCustomAddress && (
          <div className="form-group">
            <label htmlFor="recipientAddress">Recipient Wallet Address:</label>
            <input
              type="text"
              id="recipientAddress"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x..."
              required={useCustomAddress}
            />
            <small>Enter the Ethereum address of the person who will receive the tickets</small>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="quantity">Number of Tickets:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max={selectedEvent ? selectedEvent.ticketRemain : 1}
            required
          />
        </div>
        
        {selectedEvent && (
          <div className="price-summary">
            <h3>Order Summary</h3>
            <p><strong>Price per ticket:</strong> {selectedEvent.price} ETH</p>
            <p><strong>Quantity:</strong> {quantity}</p>
            <p><strong>Total price:</strong> {calculateTotalPrice()} ETH</p>
            {useCustomAddress && (
              <p><strong>Recipient:</strong> {recipientAddress || 'Please enter recipient address'}</p>
            )}
          </div>
        )}
        
        <button type="submit" disabled={isLoading || !selectedEvent || (useCustomAddress && !recipientAddress)}>
          {isLoading ? 'Processing...' : 'Buy Tickets'}
        </button>
      </form>
      
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default BuyTicket;