import React, { useEffect, useState } from "react";
import HomeOrgSide from "../../utils/HomeAdminSide";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import { API_ROUTE } from "../../env";

const AllEventsDetails = () => {
  const [events, setEvents] = useState([]);
  const [attendeesMap, setAttendeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentEvents, setCurrentEvents] = useState([]);
  const itemsPerPage = 5; // Number of events per page

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const data = localStorage.getItem("user");
        const user = JSON.parse(data);

        const response = await axios.get(`${API_ROUTE}/user/events/`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const eventsData = response.data;

        const attendeesMap = {};
        for (const event of eventsData) {
          const attendees = [];
          for (const attendeeId of event.attendees) {
            const attendeeResponse = await axios.get(
              `${API_ROUTE}/user/profile/${attendeeId}`,
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );
            attendees.push(attendeeResponse.data.userProfile);
          }
          attendeesMap[event._id] = attendees;
        }
        setAttendeesMap(attendeesMap);

        // Set events data and calculate currentEvents
        setEvents(eventsData);
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentEvents = eventsData.slice(indexOfFirstItem, indexOfLastItem);
        setCurrentEvents(currentEvents);
      } catch (error) {
        setError("Error fetching event data");
        toast.error("Error fetching event data");
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(events.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }
    return (
      <nav>
        <ul className="pagination justify-content-center">
          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <HomeOrgSide>
      <div className="container mt-4">
        <h1 className="text-center text-danger">Event Analytics</h1>
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          currentEvents.map((event) => (
            <div key={event._id} className="card mb-4 border-danger">
              <div className="card-header bg-danger text-white">
                <h2>{event.title}</h2>
              </div>
              <div className="card-body">
                <section className="mb-3">
                  <h3 className="text-danger">Ticket Sales</h3>
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket._id} className="mb-2">
                      <p>
                        <strong>Type:</strong> {ticket.type}
                      </p>
                      <p>
                        <strong>Price:</strong> ${ticket.price}
                      </p>
                      <p>
                        <strong>Total:</strong> {ticket.quantity}
                      </p>
                      <p>
                        <strong>Sold:</strong> {ticket.remaining || 0}
                      </p>
                    </div>
                  ))}
                </section>

                <section className="mb-3">
                  <h3 className="text-danger">Attendees</h3>
                  <ul className="list-group">
                    {attendeesMap[event._id] && attendeesMap[event._id].length > 0 ? (
                      attendeesMap[event._id].map((attendee) => (
                        <li key={attendee._id} className="list-group-item border">
                          {attendee.firstName} {attendee.lastName} ({attendee.email})
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item">No attendees</li>
                    )}
                  </ul>
                </section>
              </div>
            </div>
          ))
        )}
        {renderPagination()}
      </div>
    </HomeOrgSide>
  );
};

export default AllEventsDetails;
