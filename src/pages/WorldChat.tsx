import React, { useState,useEffect } from "react";

const WorldChat = ({ url }) => {
  useEffect(() => {
    console.log("Redirecting to World Chat:", url);
     window.location.href=url;

  }, [url]);

  return null;
};

export default WorldChat;