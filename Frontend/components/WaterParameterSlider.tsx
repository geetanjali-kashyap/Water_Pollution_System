import React from 'react';
import { WaterParameter } from '../types';

interface SliderProps {
  parameter: WaterParameter;
  onChange: (value: string) => void;
}

export const WaterParameterSlider: React.FC<SliderProps> = ({ parameter, onChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
      {/* Parameter Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{parameter.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{parameter.name}</h3>
            <span className="text-sm text-gray-500">{parameter.unit}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-blue-600">{parameter.value}</span>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid gap-2">
        {['Low', 'Average', 'High'].map((level) => {
          const option = parameter.options[level as keyof typeof parameter.options];
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`
                w-full px-4 py-2.5 rounded-lg text-left transition-all
                ${parameter.value === level 
                  ? 'bg-blue-50 ring-2 ring-blue-500 text-blue-700' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
              `}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{level}</span>
                <span className="text-xs text-gray-600">{option.range}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};