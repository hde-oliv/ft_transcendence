import PageLayout from "@/components/pageLayout/PageLayout";
import { Button, Flex, Input, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const socket = io("http://localhost:3000");

  const [messages, setMessages] = useState([""]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      receiveMessage(msg);
    });

    //     getInitialMessages();
  }, []);

  // const getInitialMessages = () => {
  //fetch("http://localhost:3000/chat")
  //.then((res) => res.json())
  //.then((data) => {
  //setMessages([data]);
  //});
  //};
  const receiveMessage = (msg: any) => {
    const newList = [...messages, msg];
    console.log(newList);
    setMessages(newList);
    console.log(messages);
  };

  const sendMessage = () => {
    socket.emit("send_message", newMessage);
    setNewMessage("");
  };

  const handleChange = (event: any) => setNewMessage(event.target.value);

  return (
    <PageLayout>
      <Input
        placeholder="New message"
        value={newMessage}
        onChange={handleChange}
      />
      <Button onClick={sendMessage}>Send Message</Button>

      <Stack>
        {messages.map((msg, index) => {
          return <Text key={index}>{`${msg}`}</Text>;
        })}
      </Stack>
    </PageLayout>
  );
}
