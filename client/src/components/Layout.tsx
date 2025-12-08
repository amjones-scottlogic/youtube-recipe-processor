import { Link } from 'react-router-dom';
import { ScreenRecorder } from './ScreenRecorder';

function MockBanner() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'true') return null;
  
  return (
    <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center font-medium">
      ⚠️ Running in Mock Mode - Data is not real
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <MockBanner />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-3xl font-bold text-gray-900">
            YouTube Recipe Processor
          </Link>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <footer className="bg-white shadow mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 YouTube Recipe Processor</p>
        </div>
      </footer>
    </div>
  );
}
