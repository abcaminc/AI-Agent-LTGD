
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-400">LTGD</h1>
        <p className="text-sm text-gray-400">AI Agent for US Long-Term Debt Analysis</p>
      </div>
    </header>
  );
};

export default Header;
