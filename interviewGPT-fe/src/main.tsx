import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UserContextProvider } from "./context/JobContext.tsx";
import { LoaderProvider } from "./context/loaderContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <UserContextProvider>
    <LoaderProvider>
      <App />
    </LoaderProvider>
  </UserContextProvider>
);
