
// components/TicketVerification.js
/*
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function TicketVerification({ contract, events }) {
  const [address, setAddress] = useState('');
  const [eventId, setEventId] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    setTicketInfo(null);
    setIsLoading(true);

    try {
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Please enter a valid Ethereum address');
      }

      if (eventId === '') {
        throw new Error('Please select an event');
      }

      // Get the ticket count for the specified address and event
      const ticketCount = await contract.tickets(address, eventId);
      
      // Find event details
      const event = events.find(e => e.id.toString() === eventId);
      
      if (ticketCount.toNumber() > 0) {
        // Calculate total spent
        const totalSpent = parseFloat(event.price) * ticketCount.toNumber();
        
        setTicketInfo({
          eventName: event.name,
          eventDate: event.date,
          ticketCount: ticketCount.toNumber(),
          totalSpent: totalSpent.toFixed(4)
        });
        
        setMessage(`Address has ${ticketCount.toNumber()} ticket(s) for this event.`);
      } else {
        setMessage('Address does not have tickets for this event.');
      }
    } catch (err) {
      console.error('Error verifying tickets:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="ticket-verification">
      <h2>Verify Tickets</h2>
      <p>Check if an address owns tickets for a specific event.</p>
      
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label htmlFor="address">Wallet Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
          <small>Enter the Ethereum address to check ticket ownership</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="eventId">Select Event:</label>
          <select
            id="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
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
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Tickets'}
        </button>
      </form>
      
      {ticketInfo && (
        <div className="ticket-details">
          <h3>Ticket Information</h3>
          <p><strong>Event Name:</strong> {ticketInfo.eventName}</p>
          <p><strong>Event Date:</strong> {formatDate(ticketInfo.eventDate)}</p>
          <p><strong>Number of Tickets:</strong> {ticketInfo.ticketCount}</p>
          <p><strong>Total Value:</strong> {ticketInfo.totalSpent} ETH</p>
        </div>
      )}
      
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default TicketVerification;
*/

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { jsPDF } from 'jspdf';

function TicketVerification({ contract, events }) {
  const [address, setAddress] = useState('');
  const [eventId, setEventId] = useState('');
  const [ticketInfo, setTicketInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    setTicketInfo(null);
    setIsLoading(true);

    try {
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Please enter a valid Ethereum address');
      }

      if (eventId === '') {
        throw new Error('Please select an event');
      }

      const ticketCount = await contract.tickets(address, eventId);
      const event = events.find(e => e.id.toString() === eventId);
      
      if (ticketCount.toNumber() > 0) {
        const totalSpent = parseFloat(event.price) * ticketCount.toNumber();
        
        setTicketInfo({
          eventName: event.name,
          eventDate: event.date,
          ticketCount: ticketCount.toNumber(),
          totalSpent: totalSpent.toFixed(4),
          eventId: event.id,
          attendeeAddress: address,
          organizerAddress: event.organizer,
          ticketPrice: event.price
        });
        
        setMessage(`Address has ${ticketCount.toNumber()} ticket(s) for this event.`);
      } else {
        setMessage('Address does not have tickets for this event.');
      }
    } catch (err) {
      console.error('Error verifying tickets:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const downloadTicket = () => {
    if (!ticketInfo) return;

    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(22);
    doc.setTextColor(40, 53, 147);
    doc.text('YOLO Concertzz', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Official Event Ticket', 105, 30, { align: 'center' });
    
    // Add a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Event details section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Event Details:', 20, 45);
    doc.text(`• Name: ${ticketInfo.eventName}`, 25, 55);
    doc.text(`• Date: ${formatDate(ticketInfo.eventDate)}`, 25, 65);
    doc.text(`• Ticket Price: ${ticketInfo.ticketPrice} ETH`, 25, 75);
    doc.text(`• Event ID: ${ticketInfo.eventId}`, 25, 85);
    
    // Ticket holder details section
    doc.text('Ticket Holder Information:', 20, 105);
    doc.text(`• Address: ${ticketInfo.attendeeAddress}`, 25, 115);
    doc.text(`• Tickets Purchased: ${ticketInfo.ticketCount}`, 25, 125);
    doc.text(`• Total Value: ${ticketInfo.totalSpent} ETH`, 25, 135);
    
    // Organizer information
    doc.text('Organizer:', 20, 155);
    doc.text(`• Address: ${ticketInfo.organizerAddress}`, 25, 165);
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Powered by Ethereum Blockchain', 105, 290, { align: 'center' });
    
    // Save the PDF
    doc.save(`Ticket-${ticketInfo.eventName}-${ticketInfo.attendeeAddress.substring(0, 6)}.pdf`);
  };

  return (
    <div className="ticket-verification">
      <h2>Verify Tickets</h2>
      <p>Check if an address owns tickets for a specific event.</p>
      
      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label htmlFor="address">Wallet Address:</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="eventId">Select Event:</label>
          <select
            id="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
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
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Tickets'}
        </button>
      </form>
      
      {ticketInfo && (
        <div className="ticket-details">
          <h3>Ticket Information</h3>
          <p><strong>Event Name:</strong> {ticketInfo.eventName}</p>
          <p><strong>Event Date:</strong> {formatDate(ticketInfo.eventDate)}</p>
          <p><strong>Number of Tickets:</strong> {ticketInfo.ticketCount}</p>
          <p><strong>Total Value:</strong> {ticketInfo.totalSpent} ETH</p>
          
          <button 
            onClick={downloadTicket}
            className="download-button"
          >
            Download Ticket as PDF
          </button>
        </div>
      )}
      
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default TicketVerification;