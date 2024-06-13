import React, { useEffect, useState } from "react";
import Home from "../../utils/Home";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ROUTE } from "../../env";
import Spinner from "../../utils/Spinner";

const ExploreEvents = () => {
  const [events, setEvents] = useState([]);
  const data = JSON.parse(localStorage.getItem("user"));
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    axios
      .get(`${API_ROUTE}/user/events`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      .then((response) => {
        setEvents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load events");
        setLoading(false);
      });
  }, [data.token]);

  const handleSearch = (e) => {
    setSearch(e.target.value.toLowerCase());
  };

  const handleLocationFilter = (e) => {
    setLocation(e.target.value.toLowerCase());
  };

  const handleTicketSelection = async (ticketType, event) => {
    const ticketData = {
      eventId: event._id,
      attendee: data._id,
      ticketType: ticketType.type,
      discountCode: discountCode,
    };

    try {
      const response = await axios.post(`${API_ROUTE}/user/events/${event._id}/book`, ticketData, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      toast.success(`Ticket booked successfully. Final price: $${response.data.finalPrice}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message === "You are already attending this event") {
        toast.error("You have already booked a ticket for this event.");
      } else {
        toast.error(error.response.data.message);
      }
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventTitle = event.title.toLowerCase();
    const eventVenue = event.venue?.toLowerCase() || "";

    const eventDateTime = new Date(event.date);
    const currentDate = new Date();
   
    return (
      eventTitle.includes(search) &&
      (!location || eventVenue.includes(location)) &&
      eventDateTime >= currentDate
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem+1);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = Math.ceil(filteredEvents.length / itemsPerPage);
    const pages = [];
    for (let i = 1; i <= pageNumbers; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? 'active' : ''}`}>
          <button className="page-link" onClick={() => paginate(i)}>{i}</button>
        </li>
      );
    }
    return (
      <nav>
        <ul className="pagination justify-content-center">
          {pages}
        </ul>
      </nav>
    );
  };

  return (
    <Home>
      <div className="container mt-4">
        <h1 className="text-center text-danger">Explore Events</h1>
        <div className="my-4">
          <div className="form-group">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={handleSearch}
              className="form-control mb-2"
            />
            <input
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={handleLocationFilter}
              className="form-control mb-2"
            />
            <input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="form-control mb-2"
            />
          </div>
        </div>
        <div>
          {loading ? (
            <Spinner />
          ) : filteredEvents.length > 0 ? (
            <div>
              <div className="row">
                {currentEvents.map((event) => (
                  <div key={event._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 border-danger">
                      {/* {event.image && (
                        <img
                        src={`${API_ROUTE}/images/${event.image}`} 
                        className="card-img-top"
                        alt="Event"
                      />
                      )}
                      {`${API_ROUTE}/${event.image}`} */}
                      <div className="card-body">
                        <h2 className="card-title text-danger">{event.title}</h2>
                        <p className="card-text">
                          {new Date(event.date).toLocaleDateString()} - {event.venue}
                        </p>
                        {event.description && (
                          <p className="card-text">
                            <b>Description:</b> {event.description}
                          </p>
                        )}
                        {event.time && (
                          <p className="card-text">
                            <b>Time:</b> {event.time}
                          </p>
                        )}
                        {event.ticketTypes && event.ticketTypes.length > 0 && (
                          <div>
                            <b>Ticket Types:</b>
                            <ul className="my-2">
                              {event.ticketTypes.map((ticketType) => (
                                <li key={ticketType.type}>
                                  {ticketType.type} - &#8377;{ticketType.price}{" "}
                                  (Quantity: {ticketType.quantity})
                                  <button
                                    className="btn btn-danger btn-sm mx-2 my-2"
                                    onClick={() => handleTicketSelection(ticketType, event)}
                                  >
                                    Book Me
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {renderPagination()}
            </div>
          ) : (
            <p>No events</p>
          )}
        </div>
      </div>
    </Home>
  );
};

export default ExploreEvents;