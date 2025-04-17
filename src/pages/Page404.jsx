import img404 from './404.png';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button'
const Page404 = () => {
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
      <img src={img404} alt="Page non trouvée" />
      <h1 style={styles.title}>Page non trouvée</h1>
      <p style={styles.message}>Désolé, la page que vous recherchez n&apos;existe pas.</p>
      <Button variant="contained" onClick={handleGoHome}>Retour à l&apos;accueil</Button>
    </div>
  )
}

export default Page404;
