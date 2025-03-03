
import { useNavigate } from 'react-router-dom';
import { CustomButton } from '@/components/ui/CustomButton';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-groop-darker">
      <div className="glass p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Dashboard Coming Soon</h1>
        <p className="text-white/70 mb-6 text-center">
          The Groop dashboard is currently in development. Please check back soon for the full application experience.
        </p>
        <CustomButton
          className="w-full"
          onClick={() => navigate('/')}
        >
          Return to Home
        </CustomButton>
      </div>
    </div>
  );
};

export default Dashboard;
