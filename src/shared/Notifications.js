import React, { useState, useEffect } from "react";
import { notificationsRef } from "../services/databaseRefs";
import { auth, getToken } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";

const Notifications = (props) => {
  const [isTokenFound, setTokenFound] = useState(false);

  const {user} = useAuth();

  console.log("Token found", isTokenFound);

  // To load once
  useEffect(() => {
    let data;

    async function tokenFunc() {
      data = await getToken(setTokenFound);
      if (data) {
        console.log("Token is", data);
      }
      return data;
    }

    tokenFunc();
  }, [setTokenFound]);

  return <></>;
};

Notifications.propTypes = {};

export default Notifications;