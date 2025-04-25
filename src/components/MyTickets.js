// components/MyTickets.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function MyTickets({ contract, account, events }) {
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadMyTickets = async () => {
      setIsLoading(true);
      setMessage('');
      
      try {
        const ticketsList = [];
        
        // Loop through all events to check if user has tickets
        for (let i = 0; i < events.length; i++) {
          const eventId = events[i].id;
          const ticketCount = await contract.tickets(account, eventId);
          
          if (ticketCount.toNumber() > 0) {
            ticketsList.push({
              eventId,
              eventName: events[i].name,
              eventDate: events[i].date,
              ticketCount: ticketCount.toNumber()
            });
          }
        }
        
        setMyTickets(ticketsList);
      } catch (err) {
        console.error('Error loading tickets:', err);
        setMessage(`Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (contract && account && events.length > 0) {
      loadMyTickets();
    }
  }, [contract, account, events]);

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="my-tickets">
      <h2>My Tickets</h2>
      
      {isLoading ? (
        <p>Loading your tickets...</p>
      ) : myTickets.length === 0 ? (
        <p>You don't have any tickets yet. Go to the Buy Tickets tab to purchase some!</p>
      ) : (
        <div className="tickets-container">
          {myTickets.map((ticket) => (
            <div key={ticket.eventId} className="ticket-card">
              <h3>{ticket.eventName}</h3>
              <p><strong>Event ID:</strong> {ticket.eventId}</p>
              <p><strong>Date:</strong> {formatDate(ticket.eventDate)}</p>
              <p><strong>Number of Tickets:</strong> {ticket.ticketCount}</p>
            </div>
          ))}
        </div>
      )}
      
      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default MyTickets;