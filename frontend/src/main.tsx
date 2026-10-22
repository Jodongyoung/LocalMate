import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <main>
      <h1>LocalMate</h1>
      <p role="status">LocalMate 준비 중</p>
      <p>개발 환경 초기 화면입니다. 데이터와 AI 모델은 연결되지 않았습니다.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element is missing');
createRoot(root).render(<StrictMode><App /></StrictMode>);
