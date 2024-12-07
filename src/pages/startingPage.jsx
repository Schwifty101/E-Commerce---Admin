import '../styling/index.css';
import Welcome from '../components/welcome';
import ImageSlide from '../components/imageSlider';
import LoginForm from '../components/loginCard';
import SignUpForm from '../components/signupCard';
import { BuyerMain } from './buyerMain';
import { useState } from 'react';

function StartingPage() {
  const [currentView, setCurrentView] = useState('welcome');

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginForm setCurrentView={setCurrentView} />;
      case 'profile':
        return <BuyerMain />;
      case 'signup':
        return <SignUpForm />;
      default:
        return (
          <>
            <ImageSlide />
            <Welcome onJoinClick={() => setCurrentView('login')} />
          </>
        );
    }
  };

  return (
    <div className="starting-page">
      {renderView()}
    </div>
  );
}

export default StartingPage;