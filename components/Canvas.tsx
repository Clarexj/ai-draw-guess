"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasProps {
  onDrawingComplete: (imageData: string) => void;
}

const Canvas: React.FC<CanvasProps> = ({ onDrawingComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [lastDrawTime, setLastDrawTime] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;

    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.lineTo(x, y);
    context.stroke();
    setLastDrawTime(Date.now());
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    setTimeout(() => {
      if (Date.now() - lastDrawTime > 1500 && lastDrawTime > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          const imageData = canvas.toDataURL('image/png');
          onDrawingComplete(imageData);
        }
      }
    }, 2000);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const changeColor = (color: string) => {
    if (!context) return;
    context.strokeStyle = color;
  };

  const changeLineWidth = (width: number) => {
    if (!context) return;
    context.lineWidth = width;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => changeColor('#000000')}
            className="w-8 h-8 bg-black rounded-full border-2 border-gray-300"
            aria-label="黑色"
          />
          <button
            onClick={() => changeColor('#FF0000')}
            className="w-8 h-8 bg-red-500 rounded-full border-2 border-gray-300"
            aria-label="红色"
          />
          <button
            onClick={() => changeColor('#00FF00')}
            className="w-8 h-8 bg-green-500 rounded-full border-2 border-gray-300"
            aria-label="绿色"
          />
          <button
            onClick={() => changeColor('#0000FF')}
            className="w-8 h-8 bg-blue-500 rounded-full border-2 border-gray-300"
            aria-label="蓝色"
          />
          <button
            onClick={() => changeColor('#FFFF00')}
            className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-gray-300"
            aria-label="黄色"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => changeLineWidth(2)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            细
          </button>
          <button
            onClick={() => changeLineWidth(5)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            中
          </button>
          <button
            onClick={() => changeLineWidth(10)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            粗
          </button>
        </div>

        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          清空画布 Clear
        </button>
      </div>
    </div>
  );
};

export default Canvas;