import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Mail, MapPin, GraduationCap } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const { login, signup, forgotPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    birthPlace: '',
    favoriteTeacher: '',
    newPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(formData.username, formData.password);
        onAuthSuccess();
      } else if (mode === 'signup') {
        await signup({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          securityQuestions: {
            birthPlace: formData.birthPlace,
            favoriteTeacher: formData.favoriteTeacher
          }
        });
        onAuthSuccess();
      } else if (mode === 'forgot') {
        await forgotPassword({
          username: formData.username,
          birthPlace: formData.birthPlace,
          favoriteTeacher: formData.favoriteTeacher,
          newPassword: formData.newPassword
        });
        setMode('login');
        setError('');
        alert('Password updated successfully!');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join Us' : 'Reset Password'}
        </h1>
        <p className="text-gray-600">
          {mode === 'login' ? 'Sign in to continue' : mode === 'signup' ? 'Create your account' : 'Recover your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {mode !== 'forgot' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        {mode === 'signup' && (
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        {(mode === 'signup' || mode === 'forgot') && (
          <>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="birthPlace"
                placeholder="Where were you born?"
                value={formData.birthPlace}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="favoriteTeacher"
                placeholder="Who was your favorite teacher?"
                value={formData.favoriteTeacher}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </>
        )}

        {mode === 'forgot' && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-4 text-center">
        {mode === 'login' && (
          <div className="space-y-2">
            <button
              onClick={() => setMode('signup')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Don't have an account? Sign up
            </button>
            <br />
            <button
              onClick={() => setMode('forgot')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Forgot password?
            </button>
          </div>
        )}
        
        {mode === 'signup' && (
          <button
            onClick={() => setMode('login')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Already have an account? Sign in
          </button>
        )}
        
        {mode === 'forgot' && (
          <button
            onClick={() => setMode('login')}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;