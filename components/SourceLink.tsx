
import React from 'react';
import type { Source } from '../types';

interface SourceLinkProps {
  source: Source;
}

const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center text-xs bg-gray-700 hover:bg-gray-600 text-cyan-300 rounded-full px-3 py-1 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {source.title}
    </a>
  );
};

export default SourceLink;
