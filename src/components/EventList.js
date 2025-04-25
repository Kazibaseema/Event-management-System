// components/EventList.js
import React from 'react';
import { ethers } from 'ethers';

function EventList({ events, refreshEvents }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleRefresh = async () => {
    await refreshEvents();
  };

  return (
    <div className="event-list">
      <div className="header">
        <h2>Available Events</h2>
        <button onClick={handleRefresh}>Refresh Events</button>
      </div>
      
      {events.length === 0 ? (
        <p>No events found. Be the first to create an event!</p>
      ) : (
        <div className="events-container">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p><strong>Event ID:</strong> {event.id}</p>
              <p><strong>Date:</strong> {formatDate(event.date)}</p>
              <p><strong>Timestamp:</strong> {event.date}</p>
              <p><strong>Price:</strong> {event.price} ETH</p>
              <p><strong>Available Tickets:</strong> {event.ticketRemain} / {event.ticketCount}</p>
              <p><strong>Organizer:</strong> {event.organizer.substring(0, 6)}...{event.organizer.substring(38)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;