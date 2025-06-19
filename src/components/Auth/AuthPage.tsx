import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 mx-auto">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">StreamEdit Pro</h1>
            <p className="text-xl text-gray-300 mb-8">
              Create, annotate, and collaborate on videos like never before
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Interactive video annotations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">Real-time collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Advanced editing tools</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300">Smart video management</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};