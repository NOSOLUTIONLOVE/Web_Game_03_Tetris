/**
 * App - 根组件
 *
 * 布局：TetrisGame + Footer
 */

import { TetrisGame } from './components/TetrisGame';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 gap-6">
      <TetrisGame />
      <Footer />
    </div>
  );
}

export default App;
