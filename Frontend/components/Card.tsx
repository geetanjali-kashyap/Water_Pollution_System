import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ title, description, icon, className, style }) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 ${className || ''}`}
      style={style}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Card;