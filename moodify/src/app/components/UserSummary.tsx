// hackathon_may_stackup\moodify\src\app\components\UserSummary.tsx

'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, RefreshCw } from 'lucide-react';

// defining Button component inline
const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  disabled = false, 
  onClick 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-purple-800 bg-transparent hover:bg-purple-900/20"
  };
  
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 text-sm"
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// defining card components inline
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`rounded-lg border shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
};

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
};

const CardDescription = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-400">{children}</p>;
};

const CardContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="p-6 pt-0">{children}</div>;
};

const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
};

export default function UserSummary() {
  const [summary, setSummary] = useState<string>('');
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = forceRefresh 
        ? '/api/user/summary?refresh=true' 
        : '/api/user/summary';
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setGeneratedAt(new Date(data.generatedAt));
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError('Failed to load your music personality. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary(true);
  };

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="text-gray-400">Analyzing your music personality...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardHeader>
          <CardTitle>Oops! Something went wrong</CardTitle>
          <CardDescription>We couldn't analyze your music personality right now.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => fetchSummary()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Your Music Personality</CardTitle>
        <CardDescription>
          Based on your listening history, liked tracks, and saved content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-lg">
            {summary}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {generatedAt && (
          <p className="text-sm text-gray-400">
            Generated {format(generatedAt, 'PPP')}
          </p>
        )}
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
