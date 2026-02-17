import { server } from "@theapp/webapp/lib/api.js";
import { type FC, useEffect, useState } from "react";

export const App: FC = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    server.api.get().then((res) => {
      setMessage(res.error ? JSON.stringify(res.error) : res.data);
    });
  });

  return <p>{message}</p>;
};
