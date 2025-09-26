"use client";

import { useState } from 'react';
import Canvas from '@/components/Canvas';

export default function Home() {
  const [guessResult, setGuessResult] = useState<string>('');
  const [isGuessing, setIsGuessing] = useState(false);
  const [history, setHistory] = useState<Array<{guess: string, timestamp: Date}>>([]);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);

  const handleManualGuess = async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const imageData = (canvas as HTMLCanvasElement).toDataURL('image/png');
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

  const clearCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (canvas && canvas.getContext) {
      const ctx = (canvas as HTMLCanvasElement).getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setGuessResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6 pt-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎨 AI你画我猜 | AI Draw & Guess
          </h1>
          <p className="text-gray-600 mb-1">
            在画布上画画，AI会猜你画的是什么 | Draw something and AI will guess what it is
          </p>
          <p className="text-sm text-gray-500">
            由Clare制作 | Made by Clare
          </p>
        </header>

        <div className="flex gap-6">
          {/* 左侧画布区域 */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <Canvas
                brushColor={brushColor}
                setBrushColor={setBrushColor}
                brushSize={brushSize}
                setBrushSize={setBrushSize}
              />

              {/* 底部按钮 */}
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={handleManualGuess}
                  disabled={isGuessing}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isGuessing ? '猜测中... | Guessing...' : '让AI猜 | Let AI Guess'}
                </button>
                <button
                  onClick={clearCanvas}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  清空 | Clear
                </button>
              </div>
            </div>
          </div>

          {/* 右侧结果区域 */}
          <div className="w-80">
            {guessResult && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">
                  AI的猜测 | AI's Guess
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <p className="text-base whitespace-pre-line">{guessResult}</p>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">
                  历史记录 | History
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                      <p className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{item.guess}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}