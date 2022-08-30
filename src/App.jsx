import { HomeScreen } from "./pages/HomeScreen";
import { CurrencyProvider } from "./context/CurrencyProvider";

export const App = () => {
  
  return (
    <>
      <CurrencyProvider>
        <HomeScreen />
      </CurrencyProvider>
    </>
  )
}

export default App;