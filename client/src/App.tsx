import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RecipesPage } from './recipes/RecipesPage';
import { RecipeDetail } from './recipes/components/RecipeDetail';
import { Layout } from './components/Layout';

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
