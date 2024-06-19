import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Home from "../../utils/Home";
import { API_ROUTE } from "../../env";
import { toast } from "react-toastify";
import Spinner from "../../utils/Spinner";

const AttendeeDashboard = () => {
  const data = JSON.parse(localStorage.getItem("user"));

  const [notification, setNotification] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_ROUTE}/user/events`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      .then((response) => {
        setUpcomingEvents(response.data);
        setLoadingEvents(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load events");
        setLoadingEvents(false);
      });

    axios
      .get(`${API_ROUTE}/user/notifications`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      })
      .then((response) => {
        setNotification(response.data);
        setLoadingNotifications(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load notifications");
        setLoadingNotifications(false);
      });
  }, [data.token]);

  return (
    <Home>
      <div className="container mt-4">
        <h1 className="text-center text-secondary mb-5">Dashboard</h1>

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Upcoming Events</h2>
              </div>
              <div className="card-body">
                {loadingEvents ? (
                  <Spinner />
                ) : upcomingEvents.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <li key={event.id} className="list-group-item">
                        {event.title} - {event.date.split("T")[0]}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No events</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h2 className="card-title">Notifications</h2>
              </div>
              <div className="card-body">
                {loadingNotifications ? (
                  <Spinner />
                ) : notification.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {notification.slice(0, 5).map((notification) => (
                      <li key={notification._id} className="list-group-item">
                        {notification.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No notifications</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Home>
  );
};

export default AttendeeDashboard;
