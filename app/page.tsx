"use client";

import { useState } from 'react';
import Canvas from '@/components/Canvas';

export default function Home() {
  const [guessResult, setGuessResult] = useState<string>('');
  const [isGuessing, setIsGuessing] = useState(false);
  const [history, setHistory] = useState<Array<{guess: string, timestamp: Date}>>([]);

  const handleDrawingComplete = async (imageData: string) => {
    setIsGuessing(true);
    setGuessResult('AI正在猜测... | AI is guessing...');

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const data = await response.json();
      setGuessResult(data.guess);
      setHistory(prev => [{guess: data.guess, timestamp: new Date()}, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Error:', error);
      setGuessResult('猜测失败，请重试 | Failed to guess, please try again');
    } finally {
      setIsGuessing(false);
    }
  };

  const handleManualGuess = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const imageData = (canvas as HTMLCanvasElement).toDataURL('image/png');
      handleDrawingComplete(imageData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎨 AI你画我猜 | AI Draw & Guess
          </h1>
          <p className="text-gray-600">
            在画布上画画，AI会猜你画的是什么 | Draw something and AI will guess what it is
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              画布 | Canvas
            </h2>
            <Canvas onDrawingComplete={handleDrawingComplete} />
          </div>

          <div className="text-center">
            <button
              onClick={handleManualGuess}
              disabled={isGuessing}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGuessing ? '猜测中... | Guessing...' : '让AI猜一猜 | Let AI Guess'}
            </button>
          </div>
        </div>

        {guessResult && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              AI的猜测 | AI's Guess
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <p className="text-lg whitespace-pre-line">{guessResult}</p>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              历史记录 | History
            </h2>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </p>
                  <p className="text-gray-700 whitespace-pre-line">{item.guess}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>提示：画完后点击"让AI猜一猜"或停止画画2秒后AI会自动猜测</p>
          <p>Tip: Click "Let AI Guess" or stop drawing for 2 seconds to trigger AI guessing</p>
        </footer>
      </div>
    </div>
  );
}