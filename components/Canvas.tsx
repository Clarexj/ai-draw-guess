"use client";

import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
}

const Canvas: React.FC<CanvasProps> = ({ brushColor, setBrushColor, brushSize, setBrushSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const colors = [
    { value: '#000000', label: '黑色', class: 'bg-black' },
    { value: '#FF0000', label: '红色', class: 'bg-red-500' },
    { value: '#00FF00', label: '绿色', class: 'bg-green-500' },
    { value: '#0000FF', label: '蓝色', class: 'bg-blue-500' },
    { value: '#FFFF00', label: '黄色', class: 'bg-yellow-400' },
    { value: '#FF00FF', label: '紫色', class: 'bg-purple-500' },
    { value: '#00FFFF', label: '青色', class: 'bg-cyan-500' },
    { value: '#FFA500', label: '橙色', class: 'bg-orange-500' },
  ];

  const sizes = [
    { value: 2, label: '细 | Thin' },
    { value: 5, label: '中 | Medium' },
    { value: 10, label: '粗 | Thick' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize, context]);

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
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 顶部控制面板 */}
      <div className="flex gap-6 items-center p-4 bg-gray-50 rounded-lg w-full">
        {/* 颜色选择 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">颜色 | Color:</span>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setBrushColor(color.value)}
                className={`w-8 h-8 ${color.class} rounded-full border-2 transition-all ${
                  brushColor === color.value
                    ? 'border-gray-800 scale-110 shadow-lg'
                    : 'border-gray-300 hover:scale-105'
                }`}
                aria-label={color.label}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* 画笔粗细选择 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">粗细 | Size:</span>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => setBrushSize(size.value)}
                className={`px-4 py-2 rounded transition-all ${
                  brushSize === size.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 画布 */}
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg cursor-crosshair bg-white shadow-md"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      {/* 当前画笔预览 */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>当前画笔 | Current:</span>
        <div
          className="w-6 h-6 rounded-full border-2 border-gray-400"
          style={{ backgroundColor: brushColor }}
        />
        <span className="ml-2">
          {sizes.find(s => s.value === brushSize)?.label}
        </span>
      </div>
    </div>
  );
};

export default Canvas;