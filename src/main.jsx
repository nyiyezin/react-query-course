import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { worker } from "@uidotdev/react-query-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

const queryClinet = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
		},
	},
});

const container = document.getElementById("root");
const root = createRoot(container);

new Promise((res) => setTimeout(res, 100))
	.then(() =>
		worker.start({
			quiet: true,
			onUnhandledRequest: "bypass",
		}),
	)
	.then(() => {
		root.render(
			<React.StrictMode>
				<QueryClientProvider client={queryClinet}>
					<BrowserRouter>
						<div className="container">
							<App />
						</div>
					</BrowserRouter>
				</QueryClientProvider>
			</React.StrictMode>,
		);
	});
