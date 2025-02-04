import { RouterProvider } from "react-router-dom";
import root from "./router/root.tsx"; 
import { UserProvider } from "../context/userContext.tsx";


function App() {
  return (
    <UserProvider>
      <RouterProvider router={root}/>
    </UserProvider>
  )
}

export default App