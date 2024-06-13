import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";

export default function EditEventModal({ eventId }) {
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketTypes, setTicketTypes] = useState([
    { type: "", price: "", quantity: "" },
  ]);
  const [discountCodes, setDiscountCodes] = useState([
    { code: "", discountPercentage: "", expiryDate: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const data = localStorage.getItem("user");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_ROUTE}/user/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${JSON.parse(data).token}`,
            },
          }
        );
        setEvent(response.data);
        setTitle(response.data.title);
        setDescription(response.data.description);
        setDate(response.data.date.split("T")[0]);
        setTime(response.data.time);
        setVenue(response.data.venue);
        setTicketTypes(response.data.ticketTypes);
        setDiscountCodes(response.data.discountCodes || []);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Error fetching event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, data]);

  
  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { type: "", price: "", quantity: "" }]);
  };

  const handleTicketRemove = (index) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes.splice(index, 1);
    setTicketTypes(newTicketTypes);
  };

  const handleDiscountChange = (index, field, value) => {
    const newDiscountCodes = [...discountCodes];
    newDiscountCodes[index][field] = value;
    setDiscountCodes(newDiscountCodes);
  };

  const addDiscountCode = () => {
    setDiscountCodes([
      ...discountCodes,
      { code: "", discountPercentage: "", expiryDate: "" },
    ]);
  };

  const handleDiscountRemove = (index) => {
    const newDiscountCodes = [...discountCodes];
    newDiscountCodes.splice(index, 1);
    setDiscountCodes(newDiscountCodes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !venue ||
      !ticketTypes.every(
        (ticket) => ticket.type && ticket.price && ticket.quantity
      ) ||
      !discountCodes.every(
        (discount) =>
          discount.code && discount.discountPercentage && discount.expiryDate
      )
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const eventData = {
      title,
      description,
      date,
      time,
      venue,
      ticketTypes,
      discountCodes,
      organizer: JSON.parse(data)._id,
    };

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_ROUTE}/user/events/${eventId}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(data).token}`,
          },
        }
      );
      console.log("Event updated successfully:", response.data);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
      <div className="container mt-5">
        <h1 className="text-center" style={{ color: "red" }}>Create New Event</h1>
        {loading && <Spinner />}
        {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input type="text" id="title" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Event Description</label>
            <textarea id="description" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="date">Event Date</label>
            <input type="date" id="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} min={getCurrentDate()} required />
          </div>
          <div className="form-group">
            <label htmlFor="time">Event Time</label>
            <input type="time" id="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="venue">Event Venue</label>
            <input type="text" id="venue" className="form-control" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          </div>
          <div class="input-group my-3">
            <input type="file" class="form-control" id="inputGroupFile02" />
            <label class="input-group-text" for="inputGroupFile02">
              Upload Event Image
            </label>
          </div>
          <div className="mt-4">
            <h2 style={{ color: "red" }}>Ticket Types</h2>
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="form-group border p-3 mb-2">
                <div className="form-group">
                  <label htmlFor={`type-${index}`}>Type</label>
                  <input type="text" id={`type-${index}`} className="form-control" value={ticket.type} onChange={(e) => handleTicketChange(index, "type", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor={`price-${index}`}>Price</label>
                  <input type="number" id={`price-${index}`} className="form-control" value={ticket.price} onChange={(e) => handleTicketChange(index, "price", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor={`quantity-${index}`}>Quantity</label>
                  <input type="number" id={`quantity-${index}`} className="form-control" value={ticket.quantity} onChange={(e) => handleTicketChange(index, "quantity", e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor={`remaining-${index}`}>Remaining Tickets</label>
                  <input type="number" id={`remaining-${index}`} className="form-control" value={ticket.remaining} onChange={(e) => handleTicketChange(index, "remaining", e.target.value)} required />
                </div>
                {index > 0 && (
                  <button type="button" onClick={() => handleTicketRemove(index)} className="btn btn-danger my-3">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addTicketType} className="btn btn-primary my-3 ">Add Ticket Type</button>
          </div>
          <div className="mt-4">
            <h2 style={{ color: "red" }}>Discount Codes</h2>
            {discountCodes.map((discount, index) => (
              <div key={index} className="form-group border p-3 mb-2">
              <div className="form-group">
                <label htmlFor={`code-${index}`}>Code</label>
                <input type="text" id={`code-${index}`} className="form-control" value={discount.code} onChange={(e) => handleDiscountChange(index, "code", e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor={`discountPercentage-${index}`}>Discount Percentage</label>
                <input type="number" id={`discountPercentage-${index}`} className="form-control" value={discount.discountPercentage} onChange={(e) => handleDiscountChange(index, "discountPercentage", e.target.value)} required min={0} max={100}/>
              </div>
              <div className="form-group">
                <label htmlFor={`expiryDate-${index}`}>Expiry Date</label>
                <input type="date" id={`expiryDate-${index}`} className="form-control" value={discount.expiryDate} onChange={(e) => handleDiscountChange(index, "expiryDate", e.target.value)} required />
              </div>
              {index > 0 && (
                <button type="button" onClick={() => handleDiscountRemove(index)} className="btn btn-danger my-3">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addDiscountCode} className="btn btn-primary">Add Discount Code</button>
        </div>
        <button type="submit" className="btn btn-danger mt-4">Create Event</button>
      </form>
    </div>
);
}
