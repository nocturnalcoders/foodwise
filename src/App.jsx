import { UIProvider, useUI } from './lib/ui.jsx'
import { StoreProvider, useStore } from './lib/store.jsx'
import BottomNav from './components/BottomNav.jsx'
import Splash from './pages/Splash.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Inventory from './pages/Inventory.jsx'
import AddItem from './pages/AddItem.jsx'
import MealPlanner from './pages/MealPlanner.jsx'
import Recipes from './pages/Recipes.jsx'
import ShoppingList from './pages/ShoppingList.jsx'
import WasteTracker from './pages/WasteTracker.jsx'
import Insights from './pages/Insights.jsx'
import Profile from './pages/Profile.jsx'

const PAGES = {
  splash: Splash, login: Login, home: Home, inventory: Inventory, add: AddItem, plan: MealPlanner,
  recipes: Recipes, shop: ShoppingList, waste: WasteTracker, insights: Insights, profile: Profile,
}
const NO_NAV = ['splash', 'login']

function Shell() {
  const { screen, sheet, closeSheet, toastMsg } = useUI()
  const { data, user } = useStore()
  const name = !user && !NO_NAV.includes(screen) ? 'login' : screen
  const Page = PAGES[name] || Home
  const ready = NO_NAV.includes(name) || data

  return (
    <div className="app">
      {ready ? <Page /> : <div className="splash"><p className="muted">Loading your kitchen…</p></div>}
      {!NO_NAV.includes(name) && <BottomNav />}
      {sheet && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && closeSheet()}>
          <div className="sheet" role="dialog" aria-modal="true"><div className="grab" />{sheet}</div>
        </div>
      )}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  )
}

export default function App() {
  return (
    <UIProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </UIProvider>
  )
}
