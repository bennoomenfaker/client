import img401 from './401.png';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

const Page401 = () => {
  const navigate = useNavigate();
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#333',
    },
    message: {
      fontSize: '1.5rem',
      color: '#666',
    },
    
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <img src={img401} alt="Accès non autorisé"  />
      <h1 style={styles.title}>Accès non autorisé</h1>
      <p style={styles.message}>Désolé, vous n&apos;êtes pas autorisé à accéder à cette page.</p>
      <Button variant="contained" onClick={handleGoHome}>Retour à l&apos;accueil</Button>
    </div>
  );
};

export default Page401;
