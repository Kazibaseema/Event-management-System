// components/CreateEvent.js
import React, { useState } from 'react';
import { ethers } from 'ethers';

function CreateEvent({ contract, account, refreshEvents }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [ticketCount, setTicketCount] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [useTimestamp, setUseTimestamp] = useState(false);

  const convertToTimestamp = (dateString) => {
    return Math.floor(new Date(dateString).getTime() / 1000);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setTimestamp(convertToTimestamp(e.target.value).toString());
  };

  const handleTimestampChange = (e) => {
    setTimestamp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const finalTimestamp = useTimestamp ? timestamp : convertToTimestamp(date);
      const priceInWei = ethers.utils.parseEther(price);
      
      // Create event transaction
      const tx = await contract.createEvent(
        name, 
        finalTimestamp, 
        priceInWei, 
        ticketCount
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      setMessage('Event created successfully!');
      refreshEvents();
      
      // Reset form
      setName('');
      setDate('');
      setPrice('');
      setTicketCount('');
      setTimestamp('');
    } catch (err) {
      console.error('Error creating event:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-event">
      <h2>Create New Event</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Event Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date Input Method:</label>
          <div className="toggle-container">
            <button 
              type="button" 
              className={!useTimestamp ? 'toggle-button active' : 'toggle-button'}
              onClick={() => setUseTimestamp(false)}
            >
              Calendar Date
            </button>
            <button 
              type="button" 
              className={useTimestamp ? 'toggle-button active' : 'toggle-button'}
              onClick={() => setUseTimestamp(true)}
            >
              Unix Timestamp
            </button>
          </div>
        </div>
        
        {!useTimestamp ? (
          <div className="form-group">
            <label htmlFor="date">Event Date:</label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={handleDateChange}
              required={!useTimestamp}
            />
            <small>Timestamp: {timestamp}</small>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="timestamp">Event Timestamp (Unix time):</label>
            <input
              type="number"
              id="timestamp"
              value={timestamp}
              onChange={handleTimestampChange}
              placeholder="Enter unix timestamp"
              required={useTimestamp}
            />
            <small>
              {timestamp ? `Date: ${new Date(timestamp * 1000).toLocaleString()}` : ''}
            </small>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="price">Ticket Price (ETH):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter ticket price in ETH"
            step="0.0001"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="ticketCount">Total Tickets:</label>
          <input
            type="number"
            id="ticketCount"
            value={ticketCount}
            onChange={(e) => setTicketCount(e.target.value)}
            placeholder="Enter total number of tickets"
            min="1"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
      
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default CreateEvent;