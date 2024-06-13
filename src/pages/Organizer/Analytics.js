import React, { useEffect, useState } from "react";
import HomeOrgSide from "../../utils/HomeOrgSide";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";
import { API_ROUTE } from "../../env";

const data = localStorage.getItem("user");
const user = JSON.parse(data);

// Backend API service function
const getAllEvents = async () => {
  try {
    const response = await axios.get(`${API_ROUTE}/user/events/`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const userId = user._id;
    const userCreatedEvents = response.data.filter(
      (event) => event.organizer === userId
    );

    return userCreatedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Backend API service function to get attendee details
const getAttendeeDetails = async (attendeeId) => {
  try {
    const response = await axios.get(
      `${API_ROUTE}/user/profile/${attendeeId}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    return response.data.userProfile;
  } catch (error) {
    console.error("Error fetching attendee details:", error);
    throw error;
  }
};

// Helper function to check if an event is closed
const isEventClosed = (eventDate) => {
  const currentDate = new Date();
  const eventDateObj = new Date(eventDate);
  return eventDateObj < currentDate;
};

// Helper function to calculate average rating from feedback
const calculateAverageRating = (feedback) => {
  if (feedback.length === 0) return 0;
  
  const totalRatings = feedback.reduce((sum, { rating }) => sum + rating, 0);
  return totalRatings / feedback.length;
};

// Frontend component
export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [attendeesMap, setAttendeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventsData = await getAllEvents();
        setEvents(eventsData);

        for (const event of eventsData) {
          const attendees = [];
          for (const attendeeId of event.attendees) {
            const attendee = await getAttendeeDetails(attendeeId);
            attendees.push(attendee);
          }
          setAttendeesMap((prevMap) => ({
            ...prevMap,
            [event._id]: attendees,
          }));

          // Calculate average rating for the event
          const avgRating = calculateAverageRating(event.feedback);
          event.avgRating = avgRating; // Ensure avgRating is assigned to event object
        }
      } catch (error) {
        setError("Error fetching event data");
        toast.error("Error fetching event data");
        console.error("Error fetching event data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, []);

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

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
                {isEventClosed(event.date) && (
                  <span className="badge bg-dark ms-2">Event Closed</span>
                )}
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
                        <strong>Tickets Remaining:</strong> {ticket.quantity}
                      </p>
                      <p>
                        <strong>Sold:</strong> {ticket.remaining || 0}
                      </p>
                      <hr />
                    </div>
                  ))}
                </section>

                <section className="mb-3">
                  <h3 className="text-danger">Attendees</h3>
                  <ul className="list-group">
                    {attendeesMap[event._id] &&
                    attendeesMap[event._id].length > 0 ? (
                      attendeesMap[event._id].map((attendee) => (
                        <li
                          key={attendee._id}
                          className="list-group-item border"
                        >
                          {attendee.firstName} {attendee.lastName} (
                          {attendee.email})
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item">No attendees</li>
                    )}
                  </ul>
                </section>

                <section className="mb-3">
                  <h3 className="text-danger">Feedback</h3>
                  {event.avgRating !== undefined ? ( // Check if avgRating is defined
                    <div>
                      <p>
                        <strong>Average Rating:</strong> {event.avgRating.toFixed(1)}
                      </p>
                      <ul>
                        {event.feedback.map((feedbackItem) => (
                          <li key={feedbackItem._id}>
                            <p><strong>Rating:</strong> {feedbackItem.rating}</p>
                            <p><strong>Comment:</strong> {feedbackItem.comment}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>No feedback available</p>
                  )}
                </section>
              </div>
            </div>
          ))
        )}
        {renderPagination()}
      </div>
    </HomeOrgSide>
  );
}
