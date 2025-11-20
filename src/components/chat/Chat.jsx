import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { uploadToCloudinary } from "../../lib/upload";

function Chat({ onToggleDetail, showDetail, onBack, isMobile, className }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    setIsLoading(true);
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
      setIsLoading(false);
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when chat changes or loads
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        const result = await uploadToCloudinary(img.file);
        imgUrl = result.secure_url;
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  return (
    <div className={`chat ${className || ""}`}>
      <div className="top">
        {isMobile && (
          <button
            className="back-button"
            onClick={onBack}
            title="Back to chats"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            {/* <p>Lorem ipsum dolor sit amet consectetur.</p> */}
          </div>
        </div>
        <div className="icons">
          <div
            className="info-button"
            onClick={onToggleDetail}
            title="Toggle Info"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
        </div>
      </div>
      <div className="center">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <>
            {chat?.messages?.map((message) => (
              <div
                className={
                  message.senderId === currentUser.id
                    ? "message own"
                    : "message"
                }
                key={message?.createdAt}
              >
                <div className="texts">
                  {message.img && <img src={message.img} alt="" />}

                  <p>{message.text}</p>
                  {/* <span>{message.createdAt}</span> */}
                </div>
              </div>
            ))}
            {img.url && (
              <div className="message own">
                <div className="texts">
                  <img src={img.url} alt="" />
                </div>
              </div>
            )}

            <div ref={endRef}></div>
          </>
        )}
      </div>
      <div className="bottom">
        <div className="icons">
          <label
            htmlFor="file"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <img
              src="./img.png"
              alt="Send image"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "inline-block";
              }}
              style={{
                width: 32,
                height: 32,
                cursor: "pointer",
                display: "block",
              }}
            />
            <span style={{ display: "none", lineHeight: 0 }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4a5568"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.19a1.5 1.5 0 0 1-2.12-2.12l8.49-8.49" />
              </svg>
            </span>
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          {/* <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" /> */}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send messages"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
