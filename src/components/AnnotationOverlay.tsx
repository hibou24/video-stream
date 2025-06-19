import React from 'react';
import { MessageCircle, HelpCircle, Link, Info } from 'lucide-react';
import { Annotation } from '../types';

interface AnnotationOverlayProps {
  annotations: Annotation[];
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({ annotations }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageCircle className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'link':
        return <Link className="w-4 h-4" />;
      case 'popup':
        return <Info className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-500/90';
      case 'quiz':
        return 'bg-green-500/90';
      case 'link':
        return 'bg-purple-500/90';
      case 'popup':
        return 'bg-orange-500/90';
      default:
        return 'bg-gray-500/90';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute pointer-events-auto animate-fadeIn"
          style={{
            left: annotation.position?.x || '50%',
            top: annotation.position?.y || '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          {annotation.type === 'quiz' ? (
            <div className="bg-green-500/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                {getIcon(annotation.type)}
                <h3 className="font-semibold">{annotation.title || 'Quiz'}</h3>
              </div>
              <p className="text-sm mb-3">{annotation.content}</p>
              {annotation.quizOptions && (
                <div className="space-y-2">
                  {annotation.quizOptions.map((option, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-2 bg-white/20 rounded hover:bg-white/30 transition-colors text-sm"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : annotation.type === 'link' ? (
            <a
              href={annotation.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${getTypeColor(annotation.type)} backdrop-blur-sm text-white p-3 rounded-lg shadow-xl flex items-center space-x-2 hover:scale-105 transition-transform`}
            >
              {getIcon(annotation.type)}
              <span className="text-sm font-medium">{annotation.content}</span>
            </a>
          ) : (
            <div className={`${getTypeColor(annotation.type)} backdrop-blur-sm text-white p-3 rounded-lg shadow-xl max-w-xs`}>
              <div className="flex items-center space-x-2 mb-1">
                {getIcon(annotation.type)}
                {annotation.title && (
                  <h3 className="font-semibold text-sm">{annotation.title}</h3>
                )}
              </div>
              <p className="text-sm">{annotation.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};