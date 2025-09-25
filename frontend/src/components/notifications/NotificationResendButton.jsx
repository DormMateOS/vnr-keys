import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';
import { config } from '../../utils/config';
import { handleError, handleSuccess } from '../../utils/errorHandler';

const NotificationResendButton = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const targetTime = new Date();
      targetTime.setHours(1, 0, 0); // 1:00 AM

      // Enable if it's past 1:00 AM
      setIsEnabled(now >= targetTime);
    };

    // Check initially
    checkTime();

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleResendNotification = async () => {
    if (!isEnabled) return;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${config.api.baseUrl}/notifications/resend-daily-summary`,
        {},
        { withCredentials: true }
      );

      // Handle success
      handleSuccess(response.data.message || 'Daily summary notifications resent successfully');
      
      // You might want to refresh the notifications list after resending
      // if you have a function to do so, call it here
      
    } catch (error) {
      // Handle specific error for time restriction
      if (error.response?.status === 400) {
        handleError('Daily summary notifications can only be resent after 1:00 AM');
      } else {
        handleError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleResendNotification}
      disabled={!isEnabled || isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isEnabled
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
      title={!isEnabled ? 'Available after 1:00 AM' : 'Resend daily summary notifications'}
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Sending...' : 'Resend Daily Summary'}
    </button>
  );
};

export default NotificationResendButton;