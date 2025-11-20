import React from "react";
import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { auth } from "../../../lib/firebase";

function Userinfo() {
  const { currentUser } = useUserStore();

  const handleLogout = async () => {
    await auth.signOut();
    // Reset Zustand stores so UI updates immediately
    useUserStore.setState({ currentUser: null, isLoading: false });
    if (useChatStore) useChatStore.getState().reset?.();
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "avatar.png"} alt="" />
        <h2>{currentUser.username || "John Doe"}</h2>
      </div>
      <button className="logout-btn" onClick={handleLogout} title="Logout">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>
    </div>
  );
}

export default Userinfo;
