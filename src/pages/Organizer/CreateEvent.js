import React, { useState } from "react";
import HomeOrgSide from "../../utils/HomeOrgSide";
import axios from "axios";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [ticketTypes, setTicketTypes] = useState([
    { type: "", price: "", quantity: "", remaining: 0 },
  ]);
  const [discountCodes, setDiscountCodes] = useState([
    { code: "", discountPercentage: "", expiryDate: "" },
  ]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const data = localStorage.getItem("user");
  const user = JSON.parse(data);

  const handleTicketChange = (index, field, value) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value;
    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { type: "", price: "", quantity: "", remaining: 0 },
    ]);
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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const eventDate = new Date(date);

    if (eventDate < currentDate) {
      toast.error("Event date cannot be before today.");
      return;
    }

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !venue ||
      !ticketTypes.every(
        (ticket) =>
          ticket.type &&
          ticket.price &&
          ticket.quantity &&
          ticket.remaining >= 0 &&
          ticket.remaining <= ticket.quantity
      ) ||
      ticketTypes.length === 0 ||
      !discountCodes.every(
        (discount) =>
          discount.code && discount.discountPercentage && discount.expiryDate
      ) ||
      discountCodes.length === 0
    ) {
      toast.error(
        "Please fill in all required fields and ensure valid ticket and discount information."
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("venue", venue);
    formData.append("image", image);
    formData.append("ticketTypes", JSON.stringify(ticketTypes));
    formData.append("discountCodes", JSON.stringify(discountCodes));
    formData.append("organizer", user._id);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_ROUTE}/user/events/`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Event created successfully:", response.data);
      toast.success("Event created successfully");
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Error creating event");
      toast.error("Error creating event");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <HomeOrgSide>
      <div className="container mt-5">
        <h1 className="text-center" style={{ color: "red" }}>
          Create New Event
        </h1>
        {loading && <Spinner />}
        {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              min={getCurrentDate()}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input
              type="time"
              id="time"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="venue">Venue:</label>
            <input
              type="text"
              id="venue"
              className="form-control"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Event Image:</label>
            <input
              type="file"
              id="image"
              className="form-control"
              onChange={handleImageChange}
            />
          </div>
          <h2 className="text-center my-4" style={{ color: "red" }}>
            Ticket Types
          </h2>
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="ticket-type">
              <div className="form-group">
                <label htmlFor={`ticketType-${index}`}>Type:</label>
                <input
                  type="text"
                  id={`ticketType-${index}`}
                  className="form-control"
                  value={ticket.type}
                  onChange={(e) =>
                    handleTicketChange(index, "type", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`ticketPrice-${index}`}>Price:</label>
                <input
                  type="number"
                  id={`ticketPrice-${index}`}
                  className="form-control"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketChange(index, "price", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`ticketQuantity-${index}`}>Quantity:</label>
                <input
                  type="number"
                  id={`ticketQuantity-${index}`}
                  className="form-control"
                  value={ticket.quantity}
                  onChange={(e) =>
                    handleTicketChange(index, "quantity", e.target.value)
                  }
                  required
                />
              </div>
              
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger my-2"
                  onClick={() => handleTicketRemove(index)}
                >
                  Remove Ticket Type
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary my-2"
            onClick={addTicketType}
          >
            Add Ticket Type
          </button>
          <h2 className="text-center" style={{ color: "red" }}>
            Discount Codes
          </h2>
          {discountCodes.map((discount, index) => (
            <div key={index} className="discount-code">
              <div className="form-group">
                <label htmlFor={`discountCode-${index}`}>Code:</label>
                <input
                  type="text"
                  id={`discountCode-${index}`}
                  className="form-control"
                  value={discount.code}
                  onChange={(e) =>
                    handleDiscountChange(index, "code", e.target.value)
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor={`discountPercentage-${index}`}>
                  Discount Percentage:
                </label>
                <input
                  type="number"
                  id={`discountPercentage-${index}`}
                  className="form-control"
                  value={discount.discountPercentage}
                  onChange={(e) =>
                    handleDiscountChange(
                      index,
                      "discountPercentage",
                      e.target.value
                    )
                  }
                  required
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label htmlFor={`expiryDate-${index}`}>Expiry Date:</label>
                <input
                  type="date"
                  id={`expiryDate-${index}`}
                  className="form-control my-2"
                  value={discount.expiryDate}
                  onChange={(e) =>
                    handleDiscountChange(index, "expiryDate", e.target.value)
                  }
                  required
                  min={getCurrentDate()}
                />
              </div>
              {discountCodes.length > 1 && (
              <button
                type="button"
                className="btn btn-danger my-2 "
                onClick={() => handleDiscountRemove(index)}
              >
                Remove Discount Code
              </button>)}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary my-2"
            onClick={addDiscountCode}
          >
            Add Discount Code
          </button>
          <button type="submit" className="btn btn-success mx-3 my-2">
            Create Event
          </button>
        </form>
      </div>
    </HomeOrgSide>
  );
}
