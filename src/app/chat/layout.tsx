"use client";

import React from "react";
import { AuthProvider } from "../../context/AuthContext";
import "./chat.css";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			<div className="chat-layout">{children}</div>
		</AuthProvider>
	);
}
