import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const useBotpressUser = () => {
  const { user, role } = useAuth();

  useEffect(() => {
    if (window.botpress && role === 'CUSTOMER' && user) {
      try {
        window.botpress.sendEvent({
          type: 'setUserData',
          payload: {
            userId: user.id || user.customerId || '',
            name: user.fullName || '',
            email: user.email || ''
          }
        });
      } catch (err) {
        console.warn('Failed to send user data to Botpress:', err);
      }
    }
  }, [user, role]);
};

export default useBotpressUser;

