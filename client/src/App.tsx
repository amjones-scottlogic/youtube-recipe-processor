import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { RecipesPage } from './recipes/RecipesPage';
import { RecipeDetail } from './recipes/components/RecipeDetail';

function MockBanner() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return null;
  
  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center font-medium">
      ⚠️ Running in Mock Mode - Data is not real
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <MockBanner />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-3xl font-bold text-gray-900">
            YouTube Recipe Processor
          </Link>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
