import React, { useState, useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import "./responsive.css";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [showDetail, setShowDetail] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showChat, setShowChat] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (chatId && isMobile) {
      setShowChat(true);
    }
  }, [chatId, isMobile]);

  const handleBackToList = () => {
    setShowChat(false);
  };

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticating(true);
        fetchUserInfo(user?.uid).finally(() => {
          setIsAuthenticating(false);
        });
      } else {
        setIsAuthenticating(false);
      }
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  const handleToggleDetail = () => setShowDetail((prev) => !prev);

  if (isLoading || isAuthenticating) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{isAuthenticating ? "Logging you in..." : "Loading....."}</p>
      </div>
    );
  }

  return (
    <div className="container">
      {currentUser ? (
        <>
          <div
            className={`list-wrapper ${isMobile && showChat ? "hidden" : ""}`}
          >
            <List />
          </div>
          {chatId && (
            <>
              <div
                className={`chat-wrapper ${
                  isMobile && (!showChat || showDetail) ? "hidden" : ""
                }`}
              >
                <Chat
                  onToggleDetail={handleToggleDetail}
                  showDetail={showDetail}
                  onBack={handleBackToList}
                  isMobile={isMobile}
                />
              </div>
              {showDetail && (
                <div
                  className={`detail-wrapper ${
                    isMobile && showDetail ? "active" : ""
                  }`}
                >
                  <Detail onClose={handleToggleDetail} isMobile={isMobile} />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
